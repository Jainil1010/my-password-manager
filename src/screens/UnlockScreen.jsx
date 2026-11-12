import { Lock } from "lucide-react";
import { useState } from "react";
import PasswordInput from "../ui/PasswordInput";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { unlockVault } from "../lib/vault";
import { removeData } from "../lib/storage";
import { removeSession } from "../lib/session";

export default function UnlockScreen({ onUnlocked }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [eraseOpen, setEraseOpen] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!password) return;
        setBusy(true);
        setError("");
        try {
            const { key, vault } = await unlockVault(password);
            onUnlocked(key, vault);
        } catch {
            setError("Wrong master password");
            setBusy(false);
        }
    }

    async function handleErase() {
        await removeData("vault");
        await removeSession();
        window.location.reload();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="flex h-full animate-fade-in flex-col justify-center gap-4 p-6">
            <div className="text-center">
                <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-brand/15 text-brand">
                    <Lock size={28} />
                </div>
                <h1 className="text-xl font-semibold">Welcome back</h1>
                <p className="mt-1 text-sm text-muted">
                    Enter your master password to unlock.
                </p>
            </div>
            <PasswordInput
                placeholder="Master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                autoFocus
            />
            <Button
                type="submit"
                loading={busy}
                disabled={!password}
                className="w-full">
                Unlock
            </Button>
            <button
                type="button"
                onClick={() => setEraseOpen(true)}
                className="text-center text-xs text-muted hover:text-fg">
                Forgot your password?
            </button>
            <ConfirmDialog
                open={eraseOpen}
                title="Erase vault?"
                message="we cannot recover a forgotten master password. You can erase the vault and start again, but all the saved logins will be permanently deleted. If you have a backup file, you can import it later."
                confirmLabel="Erase everything"
                danger
                onConfirm={handleErase}
                onCancle={() => setEraseOpen(false)}
            />
        </form>
    );
}
