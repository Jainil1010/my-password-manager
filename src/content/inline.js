import { fillCredentials } from "../lib/fields";

const isSecureHere = () =>
    location.protocol === "https:" || location.hostname === "localhost";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id) return;
    if (!isSecureHere()) return;
    if (msg?.type === "PING")
        sendResponse({ ok: true, host: location.hostname });
    if (msg?.type === "FILL_CREDENTIALS")
        sendResponse(
            fillCredentials(
                String(msg.username || ""),
                String(msg.password || ""),
            ),
        );
});
