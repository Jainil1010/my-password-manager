export function smartFill(username, password) {
    const POLL_MS = 300;
    const MAX_WAIT_MS = 60000;
    const USER_HINT = /user|e-?mail|login|identifier|account|phone/i;

    const isVisible = (el) => {
        const style = window.getComputedStyle(el);
        if (
            style.display === "none" ||
            style.visibility === "hidded" ||
            style.opacity === "0"
        )
            return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    };

    const looksLikeSearch = (el) =>
        el.type === "search" ||
        el.name === "q" ||
        el.getAttribute("role") === "searchbox" ||
        Boolean(el.closest('[role="search"]')) ||
        /search|query/i.test(`${el.name} ${el.id} ${el.placeholder}`);

    const usable = (el) =>
        ["text", "email", "tel"].includes(el.type) &&
        isVisible(el) &&
        !el.disabled &&
        !el.readOnly &&
        !looksLikeSearch(el);

    const setValue = (input, value) => {
        input.focus();
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
        ).set;
        setter.call(input, value);
        input.dispatchEvent(
            new InputEvent("input", {
                bubbles: true,
                inputType: "insertText",
                data: value,
            }),
        );
        input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const findPassword = () =>
        [...document.querySelectorAll('input[type="password"]')].find(
            (el) => isVisible(el) && !el.disabled,
        ) || null;

    const findUsername = (pwField) => {
        if (pwField) {
            const scope = pwField.form || document;
            let found = null;
            for (const el of scope.querySelectorAll("input")) {
                const isBefore =
                    (el.compareDocumentPosition(pwField) &
                        Node.DOCUMENT_POSITION_FOLLOWING) !==
                    0;
                if (usable(el) && isBefore) found = el;
            }
            return found;
        }
        const all = [...document.querySelectorAll("input")].filter(usable);
        return (
            all.find((el) =>
                (el.getAttribute("autocomplete") || "").includes("username"),
            ) ||
            all.find((el) => el.type === "email") ||
            all.find((el) =>
                USER_HINT.test(
                    `${el.name} ${el.id} ${el.getAttribute("aria-label") || ""} ${el.placeholder}`,
                ),
            ) ||
            null
        );
    };

    const pwField = findPassword();
    const userField = findUsername(pwField);
    if (userField && username) setValue(userField, username);
    if (pwField) {
        setValue(pwField, password);
        return { ok: true, filled: userField ? "both" : "password" };
    }
    if (!userField)
        return { ok: false, reason: "No login fields found on this page." };
    if (window.__pmFillTimer) clearInterval(window.__pmFillTimer);
    const startedAt = Date.now();
    window.__pmFillTimer = setInterval(() => {
        const field = findPassword();
        if (field) {
            clearInterval(window.__pmFillTimer);
            window.__pmFillTimer = null;
            setValue(field, password);
            setTimeout(() => {
                if (field.isConnected && field.value !== password)
                    setValue(field, password);
            }, 400);
        } else if (Date.now() - startedAt > MAX_WAIT_MS) {
            clearInterval(window.__pmFillTimer);
            window.__pmFillTimer = null;
        }
    }, POLL_MS);

    return { ok: true, filled: "username", waiting: true };
}
