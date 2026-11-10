import { useEffect, useState } from "react";
import { saveVault } from "../lib/vault.js";
import ItemRow from "./ItemRow.jsx";
import { touchSession } from "../lib/session.js";
import Generator from "./Generator.jsx";
import Backup from "./Backup.jsx";
import { matchItems } from "../lib/match.js";
import { fillItemOnTab } from "../lib/autofill.js";

const emptyForm = { site: "", username: "", password: "" };

export default function Vault({ vault, setVault, cryptoKey, onLock }) {
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [error, setError] = useState("");
    const [query, setQuery] = useState("");
    const [tab, setTab] = useState(null);

    useEffect(() => {
        chrome.tabs
            .query({ active: true, currentWindow: true })
            .then(([t]) => setTab(t || null));
    }, []);

    const isHttps = tab?.url?.startsWith("https://");
    const matches = tab?.url ? matchItems(vault.items, tab.url) : [];

    async function handleFill(item) {
        const result = await fillItemOnTab(item, tab);
        if (!result.ok || result.waiting) alert(result.message);
        if (result.ok && !result.waiting) window.close();
    }

    const filtered = vault.items.filter((i) => {
        const q = query.trim().toLowerCase();
        return (
            !q ||
            i.site.toLowerCase().includes(q) ||
            i.username.toLowerCase().includes(q)
        );
    });

    async function persist(next) {
        touchSession();
        await saveVault(next, cryptoKey);
        setVault(next);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.site.trim() || !form.password)
            return setError("Site and password are required.");
        setError("");
        let next;
        if (editingId) {
            next = {
                ...vault,
                items: vault.items.map((i) =>
                    i.id === editingId
                        ? { ...i, ...form, updatedAt: Date.now() }
                        : i,
                ),
            };
        } else {
            const item = {
                id: crypto.randomUUID(),
                ...form,
                notes: "",
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            next = { ...vault, items: [item, ...vault.items] };
        }
        await persist(next);
        setForm(emptyForm);
        setEditingId(null);
    }

    function startEdit(item) {
        setEditingId(item.id);
        setForm({
            site: item.site,
            username: item.username,
            password: item.password,
        });
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this entry?")) return;
        await persist({
            ...vault,
            items: vault.items.filter((i) => i.id !== id),
        });
    }

    return (
        <div className="p-4 space-y-4">
            {matches.length > 0 && (
                <div className="border rounded p-2 space-y-1">
                    <p className="text-sm font-medium">Matches for this site</p>
                    {matches.map((m) => (
                        <div
                            key={m.id}
                            className="flex justify-between text-sm">
                            <span>{m.username || m.site}</span>
                            <button
                                className="text-orange-600"
                                onClick={() => handleFill(m)}>
                                Fill
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <div className="flex justify-between items-center">
                <h1 className="text-lg font-semibold">
                    Vault ({vault.items.length})
                </h1>
                <button
                    className="text-sm border px-2 py-1 rounded"
                    onClick={onLock}>
                    Lock
                </button>
            </div>
            <Generator onUse={(p) => setForm({ ...form, password: p })} />
            <form onSubmit={handleSubmit} className="space-y-2">
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Site (example.com)"
                    value={form.site}
                    onChange={(e) => setForm({ ...form, site: e.target.value })}
                />
                <input
                    className="w-full border p-2 rounded"
                    placeholder="Username or email"
                    value={form.username}
                    onChange={(e) =>
                        setForm({ ...form, username: e.target.value })
                    }
                />
                <input
                    type="password"
                    className="w-full border p-2 rounded"
                    placeholder="Password"
                    value={form.password}
                    onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                    }
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button className="w-full bg-orange-600 text-white p-2 rounded">
                    {editingId ? "Save changes" : "Add entry"}
                </button>
            </form>
            <input
                className="w-full border p-2 rounded"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="space-y-2">
                {filtered.map((item) => (
                    <ItemRow
                        key={item.id}
                        item={item}
                        onEdit={() => startEdit(item)}
                        onDelete={() => handleDelete(item.id)}
                    />
                ))}
            </ul>
            <Backup onImported={onLock} />
        </div>
    );
}
