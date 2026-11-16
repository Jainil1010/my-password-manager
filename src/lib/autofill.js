import { isSecurePage } from "./match";

export async function fillItemOnTab(item, tab) {
    if (!tab?.id || !tab.url) return { ok: false, message: "No active tab." };
    if (!/^https?:\/\//i.test(tab.url))
        return {
            ok: false,
            message: "Autofill does not work on browser pages.",
        };
    if (!isSecurePage(tab.url))
        return {
            ok: false,
            message:
                "This pgae is not secure (no HTTPS). Autofill is turned off here.",
        };
    try {
        const result = await chrome.tabs.sendMessage(tab.id, {
            type: "FILL_CREDENTIALS",
            username: item.username || "",
            password: item.password,
        });
        if (!result?.ok)
            return {
                ok: false,
                message: result?.reason || "Could not fill this page.",
            };
        if (result.waiting) {
            const message =
                result.filled === "nothing"
                    ? 'Ready. Choose your account (or "Use another account") and it will fill when the field appears.'
                    : "Username filled. Click Next and the password will fill automatically.";
            return { ok: true, waiting: true, message };
        }
        return { ok: true, message: "Filled" };
    } catch {
        return {
            ok: false,
            message: "Cannot reach this page. Reload the page and try again.",
        };
    }
}
