const MAX_AGE_MS = 2 * 60 * 1000;
const key = (tabId) => `pendingSave:${tabId}`;

export async function setPending(tabId, data) {
    await chrome.storage.session.set({
        [key(tabId)]: { ...data, createdAt: Date.now() },
    });
}

export async function getPending(tabId) {
    const result = await chrome.storage.session.get(key(tabId));
    const pending = result[key(tabId)];
    if (!pending) return null;
    if (Date.now() - pending.createdAt > MAX_AGE_MS) {
        await clearPending(tabId);
        return null;
    }
    return pending;
}

export async function clearPending(tabId) {
    await chrome.storage.session.remove(key(tabId));
}
