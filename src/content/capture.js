import { send } from "./messaging";
import {
    findPasswordField,
    findUsernameField,
    isVisible,
    queryAllDeep,
} from "../lib/fields";

const SUBMIT_TEXT =
    /sign\s?in|log\s?in|next|continue|submit|verify|register|sign\s?up|create/i;

export function startCapture({ getOverlay, getSettings }) {
    let rememberedUsername = "";
    let lastCaptureAt = 0;

    function looksLikeSubmit(el) {
        if (!el) return false;
        if (el.matches('input[type="submit"]')) return true;
        if (el.matches("button") && el.type === "submit") return true;
        return SUBMIT_TEXT.test(
            el.textContent || el.getAttribute("aria-label") || "",
        );
    }

    function onPossibleSubmit() {
        if (!getSettings().offerToSave) return;
        const filled = queryAllDeep('input[type="password"]').filter(
            (el) => isVisible(el) && el.value,
        );
        const pw = filled[filled.length - 1] || null;
        if (!pw) {
            const user = findUsernameField(null, { passive: true });
            if (user?.value) rememberedUsername = user.value.trim();
            return;
        }
        const now = Date.now();
        if (now - lastCaptureAt < 800) return;
        lastCaptureAt = now;
        const userField = findUsernameField(pw);
        const username = (userField?.value || rememberedUsername || "").trim();
        send({ type: "LOGIN_CAPTURED", username, password: pw.value });
        setTimeout(maybeShowPrompt, 1500);
    }

    document.addEventListener(
        "submit",
        (e) => e.isTrusted && onPossibleSubmit(),
        true,
    );
    document.addEventListener(
        "click",
        (e) => {
            if (!e.isTrusted || !(e.target instanceof Element)) return;
            const target = e.target.closest(
                'button, input[type="submit"], [role="button"]',
            );
            if (looksLikeSubmit(target)) onPossibleSubmit();
        },
        true,
    );
    document.addEventListener(
        "keydown",
        (e) => {
            if (
                e.isTrusted &&
                e.key === "Enter" &&
                e.target instanceof HTMLInputElement
            )
                onPossibleSubmit();
        },
        true,
    );

    async function maybeShowPrompt() {
        if (!getSettings().offerToSave) return;
        if (findPasswordField()) return;
        const res = await send({ type: "GET_PENDING_SAVE" });
        if (!res?.ok || !res.pending) return;
        showPrompt(res.pending);
    }

    function showPrompt(pending) {
        const overlay = getOverlay();
        const isUpdate = pending.mode === "update";
        const close = () => overlay.hideBanner();
        overlay.showBanner({
            title: isUpdate ? "Update password?" : "Save login?",
            text: pending.username
                ? `${pending.username} on ${pending.site}`
                : pending.site,
            actions: [
                {
                    label: isUpdate ? "Update" : "Save",
                    primary: true,
                    onClick: async () => {
                        const res = await send({ type: "SAVE_PENDING" });
                        if (res?.ok) {
                            overlay.showBanner({
                                title: "Saved",
                                text: "",
                                actions: [],
                            });
                            setTimeout(close, 1500);
                        } else {
                            overlay.showBanner({
                                title: res?.locked
                                    ? "Vault is locked"
                                    : "Clould not save",
                                text: res?.locked
                                    ? "Unlock the extension, then sign in again."
                                    : "",
                                actions: [{ label: "OK", onClick: close }],
                            });
                        }
                    },
                },
                {
                    label: "Not now",
                    onClick: async () => {
                        await send({ type: "DISMISS_PENDING" });
                        close();
                    },
                },
                {
                    label: "Never for this site",
                    onClick: async () => {
                        await send({ type: "NEVER_SAVE" });
                        close();
                    },
                },
            ],
        });
    }

    setTimeout(maybeShowPrompt, 800);
}
