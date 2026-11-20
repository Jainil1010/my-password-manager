import { useState } from "react";
import { useVault } from "../state/VaultContext";
import GeneratorPanel from "../ui/GeneratorPanel";
import ScreenHeader from "../ui/ScreenHeader";
import { useToast } from "../ui/Toast";
import IconButton from "../ui/IconButton";
import { Copy, Trash2 } from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function GeneratorScreen() {
    const toast = useToast();
    const { generated, removeGenerated, clearGenerated } = useVault();
    const [clearOpen, setClearOpen] = useState(false);

    async function copy(text) {
        await navigator.clipboard.writeText(text);
        toast("Password copied");
    }
    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader title="Password generator" />
            <main className="flex-1 space-y-5 overflow-y-auto p-3">
                <GeneratorPanel useLabel="Copy password" onUse={copy} />
                <section>
                    <div className="mb-1 flex items-center justify-between px-1">
                        <h2 className="text-xs font-medium uppercase tracking-wide text-muted">
                            Recently generated
                        </h2>
                        {generated.length > 0 && (
                            <button
                                className="text-xs text-muted hover:text-fg"
                                onClick={() => setClearOpen(true)}>
                                Clear all
                            </button>
                        )}
                    </div>
                    {generated.length === 0 ? (
                        <p className="rounded-xl bg-surface px-3 py-4 text-center text-sm text-muted">
                            Passwords generated in sign-up forms appear here
                            until you save them as a login.
                        </p>
                    ) : (
                        <ul className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
                            {generated.map((g) => (
                                <li
                                    key={g.id}
                                    className="flex items-center gap-2 px-3 py-2.5">
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm">
                                            {g.site || "Unknown site"}
                                        </p>
                                        <p className="text-sm text-muted">
                                            {new Date(
                                                g.createdAt,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <IconButton
                                        label="Copy password"
                                        onClick={() => copy(g.password)}>
                                        <Copy size={17} />
                                    </IconButton>
                                    <IconButton
                                        label="Delete"
                                        onClick={() => removeGenerated(g.id)}>
                                        <Trash2 size={17} />
                                    </IconButton>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
            <ConfirmDialog
                open={clearOpen}
                title="Clear generated passwords?"
                message="These passwords will be deleted. Only do this if the accounts they belong to are already saved."
                confirmLabel="Clear"
                danger
                onConfirm={async () => {
                    await clearGenerated();
                    setClearOpen(false);
                }}
                onCancle={() => setClearOpen(false)}
            />
        </div>
    );
}
