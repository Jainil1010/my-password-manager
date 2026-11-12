import { getHostname } from "tldts";

export function hostFromSite(site = "") {
    const host = getHostname(site) || site;
    return host.replace(/^www\./, "");
}

export function itemName(item) {
    return item.title?.trim() || hostFromSite(item.site) || "Untitled";
}

export function toUrl(site = "") {
    const value = site.trim();
    if (!value) return null;
    const withProtocol = /^https?:\/\//i.test(value)
        ? value
        : `https://${value}`;
    try {
        const url = new URL(withProtocol);
        return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
        return null;
    }
}
