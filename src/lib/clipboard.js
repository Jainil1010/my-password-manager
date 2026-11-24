import { loadSettings } from "./settings";

export async function copyText(text) {
    await navigator.clipboard.writeText(text);
}

export async function copySecret(text) {
    await navigator.clipboard.writeText(text);
    const { clipboardClearSeconds } = await loadSettings();
    if (clipboardClearSeconds > 0)
        chrome.runtime
            .sendMessage({
                type: "CLIPBOARD_COPIED",
                seconds: clipboardClearSeconds,
            })
            .catch(() => {});
}
