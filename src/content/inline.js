import { detectInlineFields, fillCredentials } from "../lib/fields";
import { buildNote, createOverlay } from "./overlay";

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

if (isSecureHere() && window.top === window) start();

function start() {
    let overlay = null;
    const getOverlay = () => (overlay ??= createOverlay());

    function onIconClick(field) {
        getOverlay().openMenu(field, [
            buildNote("The icon works! Suggestions come next."),
        ]);
    }

    function scan() {
        const fields = detectInlineFields();
        if (fields.length === 0 && !overlay) return;
        getOverlay().syncFields(fields, onIconClick);
    }
    scan();
}
