import { useEffect, useState } from "react";
import { useToast } from "../ui/Toast";
import { loadSettings, saveSettings } from "../lib/settings";
import ScreenHeader from "../ui/ScreenHeader";
import IconButton from "../ui/IconButton";
import { ShieldOff, Trash2 } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { siteKey } from "../lib/match";

export default function NeverSaveScreen() {
    const toast = useToast();
    const [sites, setSites] = useState(null);
    const [newSite, setNewSite] = useState("");
    const [clearOpen, setClearOpen] = useState(false);

    useEffect(() => {
        loadSettings().then((s) => setSites(s.neverSaveSites));
    }, []);

    async function save(next) {
        setSites(next);
        await saveSettings({ neverSaveSites: next });
    }

    async function add(e) {
        e.preventDefault();
        const key = siteKey(newSite.trim());
        if (!key) return toast("Enter a webiste like example.com");
        if (sites.includes(key)) return toast("Already in the list");
        await save([...sites, key].sort());
        setNewSite("");
        toast(`${key} added`);
    }

    async function remove(site) {
        await save(sites.filter((s) => s !== site));
        toast(`${site} removed`);
    }

    if (!sites) return null;

    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader
                title="Never-save list"
                actions={
                    sites.length > 0 && (
                        <IconButton
                            label="Clear all"
                            onClick={() => setClearOpen(true)}>
                            <Trash2 size={18} />
                        </IconButton>
                    )
                }
            />
            <main className="flex-1 space-y-4 overflow-y-auto p-3">
                <p className="text-sm text-muted">
                    We will not offer to save logins on these sites. Remove a
                    site to get the prompt back.
                </p>
                <form onSubmit={add} className="flex items-end gap-2">
                    <div className="flex-1">
                        <Input
                            label="Add a site"
                            placeholder="example.com"
                            value={newSite}
                            onChange={(e) => setNewSite(e.target.value)}
                        />
                    </div>
                    <Button
                        type="submit"
                        variant="secondary"
                        className="mb-0.5">
                        Add
                    </Button>
                </form>
                {sites.length === 0 ? (
                    <div className="mt-10 text-center">
                        <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-raised text-muted">
                            <ShieldOff size={26} />
                        </div>
                        <p className="text-sm text-muted">
                            No sites in hte list.
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
                        {sites.map((site) => (
                            <li
                                key={site}
                                className="flex items-center justify-between gap-2 px-3 py-2.5">
                                <span className="truncate text-sm">{site}</span>
                                <IconButton
                                    label={`Remove ${site}`}
                                    onClick={() => remove(site)}>
                                    <Trash2 size={17} />
                                </IconButton>
                            </li>
                        ))}
                    </ul>
                )}
            </main>
            <ConfirmDialog
                open={clearOpen}
                title="Clear the never-save list?"
                message="We eill offer to save logins on all of these sites again."
                confirmLabel="Clear"
                danger
                onConfirm={async () => {
                    await save([]);
                    setClearOpen(false);
                    toast("List cleared");
                }}
                onCancle={() => setClearOpen(false)}
            />
        </div>
    );
}
