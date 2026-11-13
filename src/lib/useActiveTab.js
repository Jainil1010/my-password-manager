import { useEffect, useState } from "react";

export function useActiveTab() {
    const [tab, setTab] = useState(null);
    useEffect(() => {
        chrome.tabs
            .query({ active: true, currentWindow: true })
            .then(([t]) => setTab(t || null))
            .catch(() => setTab(null));
    }, []);
    return tab;
}
