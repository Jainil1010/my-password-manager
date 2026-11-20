import { isVisible } from "../lib/fields.js";

const CSS = `
  :host { all: initial; }
  * { box-sizing: border-box; font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }

  .icon { position: fixed; width: 22px; height: 22px; padding: 0; border: 0; border-radius: 6px;
          background: #6d4aff; color: #fff; display: grid; place-items: center; cursor: pointer;
          box-shadow: 0 1px 4px rgba(0,0,0,.35); }
  .icon svg { width: 14px; height: 14px; }

  .menu { position: fixed; width: 260px; max-height: 280px; overflow-y: auto; padding: 6px;
          background: #1f1d27; color: #f2f1f5; border: 1px solid #3a3744; border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,.45); font-size: 13px; line-height: 1.4; }
  .row { display: flex; align-items: center; gap: 10px; width: 100%; padding: 8px; border: 0;
         border-radius: 8px; background: transparent; color: inherit; text-align: left;
         cursor: pointer; font: inherit; }
  .row:hover { background: #2a2733; }
  .avatar { display: grid; place-items: center; width: 28px; height: 28px; flex: none; border-radius: 8px;
            background: #3a2f7a; color: #b9a8ff; font-weight: 600; }
  .text { display: flex; flex-direction: column; min-width: 0; }
  .name { font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .sub { color: #a09fae; font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .note { padding: 8px; color: #a09fae; }

  .banner { position: fixed; top: 16px; right: 16px; width: 300px; padding: 14px;
            background: #1f1d27; color: #f2f1f5; border: 1px solid #3a3744; border-radius: 14px;
            box-shadow: 0 8px 24px rgba(0,0,0,.45); font-size: 13px; line-height: 1.4; }
  .banner-title { font-size: 14px; font-weight: 600; }
  .banner-text { margin-top: 4px; color: #a09fae; word-break: break-word; }
  .banner-actions { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
  .btn { padding: 7px 12px; border: 0; border-radius: 8px; background: #2a2733; color: #f2f1f5;
         cursor: pointer; font: inherit; }
  .btn:hover { background: #3a3744; }
  .btn.primary { background: #6d4aff; color: #fff; }
  .btn.primary:hover { background: #8266ff; }
  .gen { padding: 8px; }
  .gen-label { color: #a09fae; font-size: 12px; }
  .gen-pw { margin: 6px 0 10px; padding: 8px; border-radius: 8px; background: #16141c;
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; font-size: 13px;
            word-break: break-all; }
  .gen-actions { display: flex; gap: 6px; }
`;

const KEY_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>`;

export function buildRow({ name, sub, onSelect }) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "row";
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = (name[0] || "?").toUpperCase();
    const text = document.createElement("span");
    text.className = "text";
    const nameEl = document.createElement("span");
    nameEl.className = "name";
    nameEl.textContent = name;
    const subEl = document.createElement("span");
    subEl.className = "sub";
    subEl.textContent = sub;
    text.append(nameEl, subEl);
    row.append(avatar, text);
    row.addEventListener("mousedown", (e) => e.preventDefault());
    row.addEventListener("click", (e) => {
        if (e.isTrusted) onSelect();
    });
    return row;
}

export function buildNote(text) {
    const note = document.createElement("div");
    note.className = "note";
    note.textContent = text;
    return note;
}

export function buildGeneratorCard({ password, onUse, onRegenerate }) {
    const makeButton = (label, primary, handler) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = primary ? "btn primary" : "btn";
        button.textContent = label;
        button.addEventListener("mousedown", (e) => e.preventDefault());
        button.addEventListener("click", (e) => {
            if (e.isTrusted) handler();
        });
        return button;
    };
    const card = document.createElement("div");
    card.className = "gen";
    const label = document.createElement("div");
    label.className = "gen-label";
    label.textContent = "Strong password";
    const pw = document.createElement("div");
    pw.className = "gen-pw";
    pw.textContent = password;
    const actions = document.createElement("div");
    actions.className = "gen-actions";
    actions.append(
        makeButton("Use password", true, onUse),
        makeButton("Regenerate", false, onRegenerate),
    );
    card.append(label, pw, actions);
    return card;
}

export function createOverlay() {
    const host = document.createElement("div");
    host.style.cssText =
        "all: initial; position: fixed; top: 0; left: 0; width: 0; height: 0; z-index: 2147483647;";
    const root = host.attachShadow({ mode: "closed" });
    const style = document.createElement("style");
    style.textContent = CSS;
    root.append(style);
    const icons = new Map();
    let menu = null;
    let menuField = null;
    let banner = null;

    let onIconClick = () => {};

    const attach = () => {
        if (!host.isConnected) document.documentElement.append(host);
    };

    function reposition() {
        for (const [field, button] of icons) {
            if (!field.isConnected || !isVisible(field)) {
                button.style.display = "none";
                continue;
            }
            const r = field.getBoundingClientRect();
            button.style.display = "grid";
            button.style.left = `${Math.round(r.right - 30)}px`;
            button.style.top = `${Math.round(r.top + (r.height - 22) / 2)}px`;
        }
        if (menu) {
            if (!menuField?.isConnected) return closeMenu();
            const r = menuField.getBoundingClientRect();
            const left = Math.max(8, Math.min(r.left, window.innerWidth - 268));
            let top = r.bottom + 6;
            if (top + menu.offsetHeight > window.innerHeight - 8)
                top = Math.max(8, r.top - menu.offsetHeight - 6);
            menu.style.left = `${left}px`;
            menu.style.top = `${top}px`;
        }
    }

    function syncFields(fields, handler) {
        onIconClick = handler;
        for (const [field, button] of icons) {
            if (!fields.includes(field) || !field.isConnected) {
                button.remove();
                icons.delete(field);
            }
        }
        for (const field of fields) {
            if (icons.has(field)) continue;
            const button = document.createElement("button");
            button.type = "button";
            button.className = "icon";
            button.title = "Password Manager";
            button.innerHTML = KEY_SVG;
            button.addEventListener("mousedown", (e) => e.preventDefault());
            button.addEventListener("click", (e) => {
                if (e.isTrusted) onIconClick(field);
            });
            root.append(button);
            icons.set(field, button);
        }
        if (icons.size > 0 || menu || banner) attach();
        reposition();
    }

    function onOutsidePointerDown(e) {
        if (e.target !== host) closeMenu();
    }

    function onMenuKey(e) {
        if (e.key === "Escape") {
            e.preventDefault();
            closeMenu();
        }
    }

    function openMenu(field, nodes) {
        closeMenu();
        menu = document.createElement("div");
        menu.className = "menu";
        menu.setAttribute("role", "listbox");
        menu.append(...nodes);
        root.append(menu);
        menuField = field;
        attach();
        reposition();
        document.addEventListener("pointerdown", onOutsidePointerDown, true);
        document.addEventListener("keydown", onMenuKey, true);
    }

    function closeMenu() {
        menu?.remove();
        menu = null;
        menuField = null;
        document.removeEventListener("pointerdown", onOutsidePointerDown, true);
        document.removeEventListener("keydown", onMenuKey, true);
    }

    function showBanner({ title, text, actions }) {
        hideBanner();
        banner = document.createElement("div");
        banner.className = "banner";
        const titleEl = document.createElement("div");
        titleEl.className = "banner-title";
        titleEl.textContent = title;
        banner.append(titleEl);
        if (text) {
            const textEl = document.createElement("div");
            textEl.className = "banner-text";
            textEl.textContent = text;
            banner.append(textEl);
        }
        if (actions.length > 0) {
            const row = document.createElement("div");
            row.className = "banner-actions";
            for (const action of actions) {
                const button = document.createElement("button");
                button.type = "button";
                button.className = action.primary ? "btn primary" : "btn";
                button.textContent = action.label;
                button.addEventListener("click", (e) => {
                    if (e.isTrusted) action.onClick();
                });
                row.append(button);
            }
            banner.append(row);
        }
        root.append(banner);
        attach();
    }

    function hideBanner() {
        banner?.remove();
        banner = null;
    }

    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return {
        syncFields,
        openMenu,
        closeMenu,
        showBanner,
        hideBanner,
        reposition,
    };
}
