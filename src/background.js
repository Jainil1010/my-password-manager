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
