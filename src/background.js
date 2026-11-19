import { ALARM_NAME, SESSION_KEY } from "./lib/constants";
import { getUnlockedVault } from "./lib/vaultAccess";
import { matchItems, isSecurePage } from "./lib/match";
import { itemName } from "./lib/items";
import { touchSession } from "./lib/session";

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) chrome.storage.session.remove(SESSION_KEY);
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

async function handleMessage(msg, sender) {
    if (sender.id !== chrome.runtime.id || !sender.tab || sender.frameId !== 0)
        return { ok: false };
    const pageUrl = sender.url;
    if (!pageUrl || !isSecurePage(pageUrl)) return { ok: false };
    switch (msg?.type) {
        case "GET_SUGGESTIONS":
            return getSuggestions(pageUrl);
        case "GET_CREDENTIALS":
            return getCredentials(pageUrl, msg.itemId);
        case "OPEN_POPUP":
            return openPopup();
        default:
            return { ok: false };
    }
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
