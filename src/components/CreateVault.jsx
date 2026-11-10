import { useState } from "react";
import { createVault } from "../lib/vault.js";

export default function CreateVault({ onCreated }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        if (password.length < 12)
            return setError("Use at least 12 characters.");
        if (password !== confirm) return setError("Passwords do not match.");
        setBusy(true);
        try {
            const { key, vault } = await createVault(password);
            onCreated(key, vault);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
            <h1 className="text-lg font-semibold">Create master password</h1>
            <p className="text-sm text-gray-600">
                This password cannot be recovered. If you forget it, your data
                is lost.
            </p>
            <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Confirm master password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
                disabled={busy}
                className="w-full bg-orange-600 text-white p-2 rounded disabled:opacity-50">
                {busy ? "Creating..." : "Create vault"}
            </button>
        </form>
    );
}
