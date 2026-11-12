import { useEffect, useState } from "react";

export function useActivateTab() {
    const [tab, setTab] = useState(null);
    useEffect(() => {
        chrome.tabs
            .query({ active: true, currentWindow: true })
            .then(([t]) => setTab(t || null))
            .catch(() => setTab(null));
    }, []);
    return tab;
}
