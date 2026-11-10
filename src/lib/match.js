import { getDomain } from "tldts";

export function matchItems(items, tabUrl) {
    const tabDomain = getDomain(tabUrl)
    if (!tabDomain) return []
    return items.filter((item) => getDomain(item.site) === tabDomain)
}