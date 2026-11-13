import { ALARM_NAME, SESSION_KEY } from "./constants.js";
import { exportKey, importKey } from "./crypto.js";
import { loadSettings } from "./settings.js";

export async function setSession(key) {
    await chrome.storage.session.set({ [SESSION_KEY]: await exportKey(key) });
    await touchSession();
}

export async function getSession() {
    const result = await chrome.storage.session.get(SESSION_KEY);
    return result[SESSION_KEY] ? importKey(result[SESSION_KEY]) : null;
}

export async function removeSession() {
    await chrome.storage.session.remove(SESSION_KEY);
    await chrome.alarms.clear(ALARM_NAME);
}

export async function touchSession() {
    const { autoLockMinutes } = await loadSettings();
    if (!autoLockMinutes) {
        await chrome.alarms.clear(ALARM_NAME);
        return;
    }
    await chrome.alarms.create(ALARM_NAME, {
        delayInMinutes: autoLockMinutes,
    });
}
