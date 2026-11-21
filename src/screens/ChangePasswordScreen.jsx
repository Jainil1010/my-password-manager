import { useNavigate } from "react-router";
import { useToast } from "../ui/Toast";
import { useVault } from "../state/VaultContext";
import { useState } from "react";
import { passwordStrength } from "../lib/strength";
import ScreenHeader from "../ui/ScreenHeader";
import { ShieldCheck, TriangleAlert } from "lucide-react";
import Button from "../ui/Button";
import { exportBackup } from "../lib/backup";
import PasswordInput from "../ui/PasswordInput";
import StrengthMeter from "../ui/StrengthMeter";

export default function ChangePasswordScreen() {
    const navigate = useNavigate();
    const toast = useToast();
    const { changeMasterPassword } = useVault();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const [done, setDone] = useState(false);
    const strength = passwordStrength(next);
    const tooShort = next.length > 0 && next.length < 12;
    const mismatch = confirm.length > 0 && confirm !== next;
    const canSubmit =
        current && next.length >= 12 && next === confirm && next !== current;

    async function handleSubmit(e) {
        e.preventDefault();
        if (!canSubmit) return;
        setBusy(true);
        setError("");
        try {
            await changeMasterPassword(current, next);
            setDone(true);
        } catch (err) {
            setError(
                err.message === "Wrong password or corrupted data"
                    ? "Your current password is wrong."
                    : err.message,
            );
        } finally {
            setBusy(false);
        }
    }

    if (done)
        return (
            <div className="flex h-full animate-fade-in flex-col">
                <ScreenHeader title="Master password changed" back={false} />
                <main className="flex flex-col items-center gap-4 p-6 text-center">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-success/15 text-success">
                        <ShieldCheck size={30} />
                    </div>
                    <p className="text-sm text-muted">
                        Your vault is now protected by the new password. Backups
                        you make <strong>before</strong> change still need your{" "}
                        <strong>old</strong> password, so export a new one now.
                    </p>
                    <Button
                        className="w-full"
                        onClick={async () => {
                            await exportBackup();
                            toast("Backup downloaded");
                        }}>
                        Export a new backup
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={() => navigate("/", { replace: true })}>
                        Done
                    </Button>
                </main>
            </div>
        );
    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader title="Change master password" />
            <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                    <PasswordInput
                        label="Current master password"
                        value={current}
                        onChange={(e) => setCurrent(e.target.value)}
                        autoFocus
                    />
                    <PasswordInput
                        label="New master password"
                        placeholder="At least 12 characters"
                        value={next}
                        onChange={(e) => setNext(e.target.value)}
                        error={tooShort ? "Use at least 12 characters" : ""}
                    />
                    <StrengthMeter
                        score={strength.score}
                        label={strength.label}
                    />
                    <PasswordInput
                        label="Confirm new master password"
                        placeholder="At least 12 characters"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        error={mismatch ? "Passwords do not match" : ""}
                    />
                    <div className="flex gap-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-300">
                        <TriangleAlert size={18} className="mt-0.5 shrink-0" />
                        <p>
                            We cannot recover this password. Changing it takes a
                            couple of seconds, so don't close the popup.
                        </p>
                    </div>
                    {error && <p className="text-sm text-danger">{error}</p>}
                </div>
                <div className="border-t border-line p-3">
                    <Button
                        type="submit"
                        loading={busy}
                        disabled={!canSubmit}
                        className="w-full">
                        Change master password
                    </Button>
                </div>
            </form>
        </div>
    );
}
