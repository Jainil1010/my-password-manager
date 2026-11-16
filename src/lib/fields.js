const USER_HINT = /user|e-?mail|login|identifier|account|phone/i;
const LOGIN_URL_HINT =
    /login|log-in|signin|sign-in|sign_in|auth|account|sso|identity|session/i;
const POLL_MS = 300;
const MAX_WAIT_MS = 120000;

export function isVisible(el) {
    const style = window.getComputedStyle(el);
    if (
        style.display === "none" ||
        style.visibility === "hidden" ||
        style.opacity === "0"
    )
        return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return false;
    const x = rect.left + window.scrollX;
    const y = rect.top + window.scrollY;
    if (x + rect.width < 0 || y + rect.height < 0) return false;
    return true;
}

export function queryAllDeep(selector, root = document) {
    const found = [...root.querySelectorAll(selector)];
    for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) found.push(...queryAllDeep(selector, el.shadowRoot));
    }
    return found;
}

const hintText = (el) =>
    `${el.name} ${el.id} ${el.getAttribute("aria-label") || ""} ${el.placeholder}`;

const autocompleteHasUsername = (el) =>
    (el.getAttribute("autocomplete") || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("username");

function looksLikeSearch(el) {
    return (
        el.type === "search" ||
        el.name === "q" ||
        el.getAttribute("role") === "searchbox" ||
        Boolean(el.closest('[role="search"]')) ||
        /search|query/i.test(hintText(el))
    );
}

function isUsable(el) {
    return (
        ["text", "email", "tel"].includes(el.type) &&
        isVisible(el) &&
        !el.disabled &&
        !el.readOnly &&
        !looksLikeSearch(el)
    );
}

export function findPasswordField() {
    return (
        queryAllDeep('input[type="password"]').find(
            (el) => isVisible(el) && !el.disabled,
        ) || null
    );
}

export function findUsernameField(pwField, { passive = false } = {}) {
    if (pwField) {
        const scope = pwField.form || pwField.getRootNode();
        let found = null;
        for (const el of scope.querySelectorAll("input")) {
            const isBefore =
                (el.compareDocumentPosition(pwField) &
                    Node.DOCUMENT_POSITION_FOLLOWING) !==
                0;
            if (isBefore && isUsable(el)) found = el;
        }
        return found;
    }
    const all = queryAllDeep("input").filter(isUsable);
    const strong = all.find(autocompleteHasUsername);
    if (strong) return strong;
    if (
        passive &&
        !LOGIN_URL_HINT.test(`${location.hostname}${location.pathname}`)
    )
        return null;
    return (
        all.find((el) => el.type === "email") ||
        all.find((el) => USER_HINT.test(hintText(el))) ||
        null
    );
}

export function detectInlineFields() {
    const pwFields = queryAllDeep('input[type="password"]').filter(
        (el) => isVisible(el) && !el.disabled,
    );
    if (pwFields.length > 1) return [];
    const pw = pwFields[0] || null;
    const user = findUsernameField(pw, { passive: true });
    return [user, pw].filter(Boolean);
}

export function setFieldValue(input, value) {
    input.focus();
    const setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
    ).set;
    setter.call(input, value);
    input.dispatchEvent(
        new InputEvent("input", {
            bubbles: true,
            composed: true,
            inputType: "insertText",
            data: value,
        }),
    );
    input.dispatchEvent(new Event("change", { bubbles: true }));
}

let fillTimer = null;
function stopWatching() {
    if (fillTimer) clearInterval(fillTimer);
    fillTimer = null;
}

export function fillCredentials(username, password) {
    const doneUsernames = new WeakSet();
    const attempt = () => {
        const pwField = findPasswordField();
        const userField = findUsernameField(pwField);
        let filledUser = false;
        if (userField && username && !doneUsernames.has(userField)) {
            setFieldValue(userField, username);
            doneUsernames.add(userField);
            filledUser = true;
        }
        if (pwField) {
            setFieldValue(pwField, password);
            return {
                done: true,
                pwField,
                filled: userField ? "both" : "password",
            };
        }
        return { done: false, filled: filledUser ? "username" : null };
    };
    stopWatching();
    const first = attempt();
    if (first.done) return { ok: true, filled: first.filled };
    const startedAt = Date.now();
    fillTimer = setInterval(() => {
        const next = attempt();
        if (next.done) {
            stopWatching();
            setTimeout(() => {
                if (next.pwField.isConnected && next.pwField.value !== password)
                    setFieldValue(next.pwField, password);
            }, 400);
        } else if (Date.now() - startedAt > MAX_WAIT_MS) {
            stopWatching();
        }
    }, POLL_MS);
    return { ok: true, waiting: true, filled: first.filled || "nothing" };
}
