import { smartFill } from "./fill";
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
        const [res] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: smartFill,
            args: [item.username || "", item.password],
        });
        const result = res?.result;
        if (!result?.ok)
            return {
                ok: false,
                message: result?.reason || "Could not fill this page.",
            };
        if (result.waiting)
            return {
                ok: true,
                waiting: true,
                message:
                    "Username filled. Click Next and the password will fill automatically.",
            };
        return { ok: true, message: "Filled" };
    } catch {
        return { ok: false, message: "Cannot fill on this page." };
    }
}
