import { useState } from "react";
import { passwordStrength } from "../lib/strength";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import PasswordInput from "../ui/PasswordInput";
import StrengthMeter from "../ui/StrengthMeter";
import Button from "../ui/Button";
import { createVault } from "../lib/vault";

export default function CreateVaultScreen({ onCreated }) {
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [understood, setUnderstood] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const strength = passwordStrength(password);
    const tooShort = password.length > 0 && password.length < 12;
    const mismatch = confirm.length > 0 && confirm !== password;
    const canSubmit =
        password.length >= 12 && password === confirm && understood;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        setError("");
        try {
            const { key, vault } = await createVault(password);
            onCreated(key, vault);
        } catch (err) {
            setError(err.message);
            setBusy(false);
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex h-full animate-fade-in flex-col gap-4 overflow-y-auto p-6">
            <div className="text-center">
                <div className="mx-auto mb-3 grid h-14 place-items-center rounded-2xl bg-brand/15 text-brand">
                    <ShieldCheck size={30} />
                </div>
                <h1 className="text-xl font-semibold">Create your vault</h1>
                <p className="mt-1 text-sm text-muted">
                    One master password protects everything.
                </p>
            </div>
            <PasswordInput
                label="Master password"
                placeholder="At least 12 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={tooShort ? "Use at least 12 characters" : ""}
                autoFocus
            />
            <StrengthMeter score={strength.score} label={strength.label} />
            <PasswordInput
                label="Confirm master password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                error={mismatch ? "Passwords do not match" : ""}
            />
            <div className="flex gap-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
                <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                <div>
                    <p>
                        We cannot recover this password. If you forget it, your
                        data is lost. Keep a backup of your vault in Settings.
                    </p>
                    <label className="mt-2 flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={understood}
                            onChange={(e) => setUnderstood(e.target.checked)}
                            className="accent-brand"
                        />{" "}
                        I understand
                    </label>
                </div>
            </div>
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
                type="submit"
                loading={busy}
                disabled={!canSubmit}
                className="mt-auto w-full">
                Create vault
            </Button>
        </form>
    );
}
