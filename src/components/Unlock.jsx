import { useState } from "react";
import { unlockVault } from "../lib/vault.js";

export default function Unlock({ onUnlocked }) {
    const [password, serPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setBusy(true);
        try {
            const { key, vault } = await unlockVault(password);
            onUnlocked(key, vault);
        } catch {
            setError("Wrong master password.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <h1 className="text-lg font-semibold">Unlock</h1>
            <input
                type="password"
                autoFocus
                className="w-full border p-2 rounded"
                placeholder="Master password"
                value={password}
                onChange={(e) => serPassword(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                disabled={busy}
                className="w-full bg-orange-600 text-white p-2 rounded disabled:opacity-50">
                {busy ? "Unlocking..." : "Unlock"}
            </button>
        </form>
    );
}
