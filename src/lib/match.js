import { getDomain, getHostname } from "tldts";

function siteKey(value) {
    if (!value) return null;
    return getDomain(value) || getHostname(value);
}

export function matchItems(items, tabUrl) {
    if (!/^https?:\/\//i.test(tabUrl || "")) return [];
    const tabKey = siteKey(tabUrl);
    if (!tabKey) return [];
    return items.filter((item) => siteKey(item.site) === tabKey);
}

export function isSecurePage(tabUrl) {
    try {
        const url = new URL(tabUrl);
        return (
            url.protocol === "https:" ||
            url.hostname === "localhost" ||
            url.hostname === "127.0.0.1"
        );
    } catch {
        return false;
    }
}
