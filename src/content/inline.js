import {
    fillCredentials,
    detectInlineTarget,
    setFieldValue,
} from "../lib/fields";
import {
    createOverlay,
    buildRow,
    buildNote,
    buildGeneratorCard,
} from "./overlay";
import { send } from "./messaging";
import { loadSettings } from "../lib/settings";
import { startCapture } from "./capture";
import { generatePassword } from "../lib/generator";

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

    async function openSuggestions(field) {
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

    async function onIconClick(field) {
        const target = detectInlineTarget();
        if (!target) return;
        if (target.kind === "signup")
            return openGenerator(field, target.newFields);
        return openSuggestions(field);
    }

    const makePassword = () =>
        generatePassword({
            length: settings.generatorLength,
            symbols: settings.generatorSymbols,
        });

    async function openGenerator(field, newFields) {
        const o = getOverlay();
        const status = await send({ type: "GET_STATUS" });
        if (!status?.ok)
            return o.openMenu(field, [
                buildNote("Password Manager is not available on this page."),
            ]);
        if (status.locked)
            return o.openMenu(field, [
                buildRow({
                    name: "Unlock to generate a password",
                    sub: "So we can save it for you",
                    onSelect: unlock,
                }),
            ]);
        let password = makePassword();
        const show = () =>
            o.openMenu(field, [
                buildGeneratorCard({
                    password,
                    onRegenerate: () => {
                        password = makePassword();
                        show();
                    },
                    onUse: use,
                }),
            ]);

        async function use() {
            o.closeMenu();
            const saved = await send({ type: "GENERATED", password });
            if (!saved?.ok) {
                return o.openMenu(field, [
                    buildNote(
                        "Could not store the password, so nothing was filled. Unlock the extension and try again.",
                    ),
                ]);
            }
            for (const input of newFields) {
                if (input.isConnected) setFieldValue(input, password);
            }
        }
        show();
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
        const target = settings.inlineSuggestions ? detectInlineTarget() : null;
        if (!target && !overlay) return;
        getOverlay().syncFields(target ? [target.field] : [], onIconClick);
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
