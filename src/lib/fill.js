export function smartFill(username, password) {
    const POLL_MS = 300;
    const MAX_WAIT_MS = 120000;
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

    const doneUsernames = new WeakSet();
    const attempt = () => {
        const pwField = findPassword();
        const userField = findUsername(pwField);
        let filledUser = false;
        if (userField && username && !doneUsernames.has(userField)) {
            setValue(userField, username);
            doneUsernames.add(userField);
            filledUser = true;
        }
        if (pwField) {
            setValue(pwField, password);
            return {
                done: true,
                pwField,
                filled: userField ? "both" : "password",
            };
        }
        return { dont: false, filled: filledUser ? "username" : null };
    };

    const stop = () => {
        clearInterval(window.__pmFillTimer);
        window.__pmFillTimer = null;
    };

    stop();
    const first = attempt();
    if (first.done) return { ok: true, filled: first.filled };

    const startedAt = Date.now();
    window.__pmFillTimer = setInterval(() => {
        const next = attempt();
        if (next.done) {
            stop();
            setTimeout(() => {
                if (next.pwField.isConnected && next.pwField.value !== password)
                    setValue(next.pwField, password);
            }, 400);
        } else if (Date.now() - startedAt > MAX_WAIT_MS) stop();
    }, POLL_MS);

    return { ok: true, waiting: true, filled: first.filled || "nothing" };
}
