export function fillLoginForm(username, password) {
    const visible = (el) =>
        el.offsetParent !== null || el.getClientRects().length > 0;
    const setValue = (input, value) => {
        const setter = Object.getOwnPropertyDescriptor(
            HTMLInputElement.prototype,
            "value",
        ).set;
        setter.call(input, value);
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const pw = [...document.querySelectorAll('input[type="password"]')].find(
        visible,
    );
    if (!pw)
        return { ok: false, reason: "No password field found on this page." };
    const scope = pw.form || document;
    let user = null;
    for (const el of scope.querySelectorAll("input")) {
        if (!visible(el) || !["text", "email", "tel"].includes(el.type))
            continue;
        if (el.compareDocumentPosition(pw) & Node.DOCUMENT_POSITION_FOLLOWING)
            user = el;
    }
    if (user && username) setValue(user, username);
    setValue(pw, password);
    return { ok: true };
}
