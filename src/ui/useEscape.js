import { useEffect, useRef } from "react";

const stack = [];
let attached = false;

function onKeyDown(e) {
    if (e.key !== "Escape" || stack.length === 0) return;
    e.preventDefault();
    e.stopPropagation();
    stack[stack.length - 1].call();
}

export function useEscape(active, handler) {
    const latest = useRef(handler);
    useEffect(() => {
        latest.current = handler;
    });
    useEffect(() => {
        if (!active) return;
        if (!attached) {
            window.addEventListener("keydown", onKeyDown, true);
            attached = true;
        }
        const entry = { call: () => latest.current() };
        stack.push(entry);
        return () => {
            const i = stack.indexOf(entry);
            if (i !== -1) stack.splice(i, 1);
        };
    }, [active]);
}
