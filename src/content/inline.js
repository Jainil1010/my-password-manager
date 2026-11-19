import { fillCredentials, detectInlineFields } from "../lib/fields";
import { createOverlay, buildRow, buildNote } from "./overlay";
import { send } from "./messaging";
import { loadSettings } from "../lib/settings";
import { startCapture } from "./capture";

const isSecureHere = () =>
    location.protocol === "https:" || location.hostname === "localhost";

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== chrome.runtime.id) return;
    if (!isSecureHere()) return;
    if (msg?.type === "PING")
        sendResponse({ ok: true, host: location.hostname });
    if (msg?.type === "FILL_CREDENTIALS") {
        sendResponse(
            fillCredentials(
                String(msg.username || ""),
                String(msg.password || ""),
            ),
        );
    }
});

if (isSecureHere() && window.top === window) start();

async function start() {
    let settings = await loadSettings();
    let overlay = null;
    const getOverlay = () => (overlay ??= createOverlay());

    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.settings) {
            loadSettings().then((s) => {
                settings = s;
                scan();
            });
        }
    });

    async function onIconClick(field) {
        const o = getOverlay();
        o.openMenu(field, [buildNote("Loading...")]);
        const res = await send({ type: "GET_SUGGESTIONS" });
        if (!res?.ok) {
            return o.openMenu(field, [
                buildNote("Password Manager is not available on this page."),
            ]);
        }
        if (res.locked) {
            return o.openMenu(field, [
                buildRow({
                    name: "Unlock Password Manager",
                    sub: "Open the extension to unlock",
                    onSelect: unlock,
                }),
            ]);
        }
        if (res.items.length === 0) {
            return o.openMenu(field, [
                buildNote("No saved logins for this site."),
            ]);
        }
        o.openMenu(
            field,
            res.items.map((item) =>
                buildRow({
                    name: item.name,
                    sub: item.username || "No username",
                    onSelect: () => pick(item.id),
                }),
            ),
        );
    }

    async function pick(itemId) {
        overlay.closeMenu();
        const creds = await send({ type: "GET_CREDENTIALS", itemId });
        if (!creds?.ok) return;
        fillCredentials(creds.username, creds.password);
    }

    async function unlock() {
        overlay.closeMenu();
        await send({ type: "OPEN_POPUP" });
    }

    function scan() {
        const fields = settings.inlineSuggestions ? detectInlineFields() : [];
        if (fields.length === 0 && !overlay) return;
        getOverlay().syncFields(fields, onIconClick);
    }

    let scanScheduled = false;
    function scheduleScan() {
        if (scanScheduled) return;
        scanScheduled = true;
        setTimeout(() => {
            scanScheduled = false;
            scan();
        }, 400);
    }

    new MutationObserver(scheduleScan).observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "hidden", "type"],
    });
    window.addEventListener("focusin", scheduleScan, true);

    startCapture({ getOverlay, getSettings: () => settings });
    scan();
}
