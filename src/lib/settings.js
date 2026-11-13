import { getData, setData } from "./storage";

const KEY = "settings";
export const DEFAULT_SETTINGS = { autoLockMinutes: 5 };

export async function loadSettings() {
    return { ...DEFAULT_SETTINGS, ...(await getData(KEY)) };
}

export async function saveSettings(partial) {
    const current = await loadSettings();
    await setData(KEY, { ...current, ...partial });
}
