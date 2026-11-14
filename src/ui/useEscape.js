import { useEffect } from "react";

export function useEscape(active, handler) {
    useEffect(() => {
        if (!active) return;
        const onKey = (e) => {
            if (e.key === "Escape") handler();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [active, handler]);
}
