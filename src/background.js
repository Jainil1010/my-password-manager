import { ALARM_NAME, SESSION_KEY } from "./lib/constants";
import { getUnlockedVault } from "./lib/vaultAccess";
import { matchItems, isSecurePage, siteKey } from "./lib/match";
import { itemName } from "./lib/items";
import { touchSession } from "./lib/session";
import { clearPending, getPending, setPending } from "./lib/pending";
import { loadSettings, saveSettings } from "./lib/settings";
import { saveVault } from "./lib/vault";

const CLIPBOARD_ALARM = "clear-clipboard";
const MIN_ALARM_SECONDS = 30;

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === ALARM_NAME) {
        await chrome.storage.session.remove(SESSION_KEY);
        await flushClipboardIfPending();
    }
    if (alarm.name === CLIPBOARD_ALARM) await clearClipboardNow();
});

chrome.idle.onStateChanged.addListener((state) => {
    if (state === "locked") chrome.session.remove(SESSION_KEY);
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    handleMessage(msg, sender)
        .then(sendResponse)
        .catch(() => sendResponse({ ok: false }));
    return true;
});

chrome.commands.onCommand.addListener(async (command, tab) => {
    if (command === "fill-login") await fillBestMatch(tab);
});

chrome.tabs.onRemoved.addListener((tabId) => clearPending(tabId));

async function handleMessage(msg, sender) {
    if (sender.id !== chrome.runtime.id) return { ok: false };
    if (sender.url?.startsWith(chrome.runtime.getURL("")))
        return handleExtensionPageMessage(msg);
    if (!sender.tab || sender.frameId !== 0) return { ok: false };
    const pageUrl = sender.url;
    if (!pageUrl || !isSecurePage(pageUrl)) return { ok: false };
    const tabId = sender.tab.id;
    switch (msg?.type) {
        case "GET_SUGGESTIONS":
            return getSuggestions(pageUrl);
        case "GET_CREDENTIALS":
            return getCredentials(pageUrl, msg.itemId);
        case "OPEN_POPUP":
            return openPopup();
        case "LOGIN_CAPTURED":
            return loginCaptured(pageUrl, tabId, msg);
        case "GET_PENDING_SAVE":
            return getPendingSave(tabId);
        case "SAVE_PENDING":
            return savePending(tabId);
        case "DISMISS_PENDING":
            await clearPending(tabId);
            return { ok: true };
        case "NEVER_SAVE":
            return neverSave(tabId);
        case "GET_STATUS":
            return getStatus();
        case "GENERATED":
            return recordGenerated(pageUrl, msg.password);
        default:
            return { ok: false };
    }
}

async function handleExtensionPageMessage(msg) {
    switch (msg?.type) {
        case "CLIPBOARD_COPIED":
            await scheduleClipboardClear(Number(msg.seconds) || 0);
            return { ok: true };
        case "CLIPBOARD_FLUSH":
            await flushClipboardIfPending();
            return { ok: true };
        default:
            return { ok: false };
    }
}

async function scheduleClipboardClear(seconds) {
    if (!seconds) return;
    await chrome.alarms.create(CLIPBOARD_ALARM, {
        delayInMinutes: Math.max(seconds, MIN_ALARM_SECONDS) / 60,
    });
}

async function ensureOffscreen() {
    const existing = await chrome.runtime.getContexts({
        contextTypes: ["OFFSCREEN_DOCUMENT"],
    });
    if (existing.length > 0) return;
    await chrome.offscreen.createDocument({
        url: "offscreen.html",
        reasons: ["CLIPBOARD"],
        justification:
            "Clear a copied password from the clipboard after a delay",
    });
}

async function clearClipboardNow() {
    await chrome.alarms.clear(CLIPBOARD_ALARM);
    try {
        await ensureOffscreen();
        await chrome.runtime.sendMessage({
            target: "offscreen",
            type: "CLEAR_CLIPBOARD",
        });
    } catch {
    } finally {
        await chrome.offscreen.closeDocument().catch(() => {});
    }
}

async function flushClipboardIfPending() {
    if (await chrome.alarms.get(CLIPBOARD_ALARM)) await clearClipboardNow();
}

async function getSuggestions(pageUrl) {
    const unlocked = await getUnlockedVault();
    if (!unlocked) return { ok: true, locked: true, items: [] };
    const matches = matchItems(unlocked.vault.items, pageUrl);
    return {
        ok: true,
        locked: false,
        items: matches.map((i) => ({
            id: i.id,
            name: itemName(i),
            username: i.username || "",
        })),
    };
}

async function getCredentials(pageUrl, itemId) {
    const unlocked = await getUnlockedVault();
    if (!unlocked) return { ok: false, locked: true };
    const item = matchItems(unlocked.vault.items, pageUrl).find(
        (i) => i.id === itemId,
    );
    if (!item) return { ok: false };
    touchSession();
    return { ok: true, username: item.username || "", password: item.password };
}

async function openPopup() {
    try {
        await chrome.action.openPopup();
        return { ok: true };
    } catch {
        return { ok: false };
    }
}

async function fillBestMatch(tab) {
    if (!tab?.id || !tab.url || !isSecurePage(tab.url)) return flash("X");
    const unlocked = await getUnlockedVault();
    if (!unlocked) {
        await openPopup();
        return;
    }
    const matches = matchItems(unlocked.vault.items, tab.url);
    if (matches.length === 0) return flash("0");
    if (matches.length > 1) {
        await openPopup();
        return;
    }
    const item = matches[0];
    try {
        const result = await chrome.tabs.sendMessage(tab.id, {
            type: "FILL_CREDENTIALS",
            username: item.username || "",
            password: item.password,
        });
        flash(result?.ok ? "OK" : "!");
    } catch {
        flash("!");
    }
    touchSession();
}

async function flash(text) {
    await chrome.action.setBadgeBackgroundColor({ color: "#6d4aff" });
    await chrome.action.setBadgeText({ text });
    setTimeout(() => chrome.action.setBadgeText({ text: "" }), 2000);
}

async function loginCaptured(pageUrl, tabId, msg) {
    const password = typeof msg.password === "string" ? msg.password : "";
    const username =
        typeof msg.username === "string"
            ? msg.username.trim().slice(0, 256)
            : "";
    if (!password || password.length > 1024) return { ok: true };
    const settings = await loadSettings();
    const key = siteKey(pageUrl);
    if (!settings.offerToSave || !key || settings.neverSaveSites.includes(key))
        return { ok: true };
    const unlocked = await getUnlockedVault();
    if (!unlocked) return { ok: true };
    const candidates = matchItems(unlocked.vault.items, pageUrl);
    let sameLogin = candidates.find(
        (i) => (i.username || "").toLowerCase() === username.toLowerCase(),
    );
    if (!sameLogin && !username && candidates.length === 1)
        sameLogin = candidates[0];
    if (!username && !sameLogin) return { ok: true };
    if (sameLogin && sameLogin.password === password) return { ok: true };
    await setPending(tabId, {
        mode: sameLogin ? "update" : "new",
        itemId: sameLogin?.id || null,
        site: key,
        username: username || sameLogin?.username || "",
        password,
    });
    return { ok: true };
}

async function getPendingSave(tabId) {
    const pending = await getPending(tabId);
    if (!pending) return { ok: true, pending: null };
    return {
        ok: true,
        pending: {
            mode: pending.mode,
            site: pending.site,
            username: pending.username,
        },
    };
}

async function savePending(tabId) {
    const pending = await getPending(tabId);
    if (!pending) return { ok: false };
    const unlocked = await getUnlockedVault();
    if (!unlocked) return { ok: false, locked: true };
    const { vault, key } = unlocked;
    const now = Date.now();
    let items;
    if (
        pending.mode === "update" &&
        vault.items.some((i) => i.id === pending.itemId)
    ) {
        items = vault.items.map((i) =>
            i.id === pending.itemId
                ? { ...i, password: pending.password, updatedAt: now }
                : i,
        );
    } else {
        const item = {
            id: crypto.randomUUID(),
            title: "",
            notes: "",
            site: pending.site,
            username: pending.username,
            password: pending.password,
            createdAt: now,
            updatedAt: now,
        };
        items = [item, ...vault.items];
    }
    const generated = (vault.generated || []).filter(
        (g) => g.password !== pending.password,
    );
    const next = { ...vault, items, generated };
    await saveVault(next, key);
    await clearPending(tabId);
    touchSession();
    return { ok: true };
}

async function neverSave(tabId) {
    const pending = await getPending(tabId);
    if (pending) {
        const settings = await loadSettings();
        await saveSettings({
            neverSaveSites: [
                ...new Set([...settings.neverSaveSites, pending.site]),
            ],
        });
    }
    await clearPending(tabId);
    return { ok: true };
}

async function getStatus() {
    const unlocked = await getUnlockedVault();
    return { ok: true, locked: !unlocked };
}

async function recordGenerated(pageUrl, password) {
    if (
        typeof password !== "string" ||
        password.length === 0 ||
        password.length > 128
    )
        return { ok: false };
    const unlocked = await getUnlockedVault();
    if (!unlocked) return { ok: false, locked: true };
    const { vault, key } = unlocked;
    const entry = {
        id: crypto.randomUUID(),
        site: siteKey(pageUrl),
        password,
        createdAt: Date.now(),
    };
    const generated = [entry, ...(vault.generated || [])].slice(0, 20);
    await saveVault({ ...vault, generated }, key);
    touchSession();
    return { ok: true };
}
