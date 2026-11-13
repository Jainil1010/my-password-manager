import { useNavigate } from "react-router";
import { useToast } from "../ui/Toast";
import { useVault } from "../state/VaultContext";
import { useEffect, useRef, useState } from "react";
import { loadSettings, saveSettings } from "../lib/settings";
import { removeSession, touchSession } from "../lib/session";
import { exportBackup, importBackup } from "../lib/backup";
import { removeData } from "../lib/storage";
import ScreenHeader from "../ui/ScreenHeader";
import {
    ChevronRight,
    Download,
    ExternalLink,
    KeyRound,
    Lock,
    Trash2,
    Upload,
} from "lucide-react";
import ConfirmDialog from "../ui/ConfirmDialog";

const AUTO_LOCK_OPTIONS = [
    [1, "1 minute"],
    [5, "5 minutes"],
    [15, "15 minutes"],
    [30, "30 minutes"],
    [60, "1 hour"],
    [0, "Until browser closes"],
];

function Group({ title, children }) {
    return (
        <section>
            <h2 className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-muted">
                {title}
            </h2>
            <div className="divide-y divide-line overflow-hidden rounded-xl bg-surface">
                {children}
            </div>
        </section>
    );
}

function Row({ icon: Icon, label, hint, onClick, right, danger = false }) {
    const Tag = onClick ? "button" : "div";
    return (
        <Tag
            type={onClick ? "button" : undefined}
            onClick={onClick}
            className={`flex w-full items-center gap-3 px-3 py-3 text-left text-sm ${onClick ? "hover:bg-raised" : ""} ${danger ? "text-danger" : ""}`}>
            {Icon && <Icon size={18} className={danger ? "" : "text-muted"} />}
            <span className="min-w-0 flex-1">
                <span className="block">{label}</span>
                {hint && (
                    <span className="block text-xs text-muted">{hint}</span>
                )}
            </span>
            {right}
        </Tag>
    );
}

export default function SettingsScreen() {
    const navigate = useNavigate();
    const toast = useToast();
    const { lock } = useVault();
    const fileRef = useRef(null);
    const [autoLock, setAutoLock] = useState(5);
    const [pendingFile, setPendingFile] = useState(null);
    const [eraseOpen, setEraseOpen] = useState(false);

    useEffect(() => {
        loadSettings().then((s) => setAutoLock(s.autoLockMinutes));
    }, []);

    async function changeAutoLock(e) {
        const minutes = Number(e.target.value);
        setAutoLock(minutes);
        await saveSettings({ autoLockMinutes: minutes });
        await touchSession();
        toast("Auto-lock updated");
    }

    async function handleExport() {
        try {
            await exportBackup();
            toast("Backup downloaded");
        } catch (err) {
            toast(err.message);
        }
    }

    async function handleImport() {
        try {
            await importBackup(pendingFile);
            window.location.reload();
        } catch (err) {
            setPendingFile(null);
            toast(err.message, 3500);
        }
    }

    async function handleErase() {
        await removeData("vault");
        await removeSession();
        window.location.reload();
    }

    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader title="Settings" />
            <main className="flex-1 space-y-4 overflow-y-auto p-3">
                <Group title="Security">
                    <Row
                        label="Auto-lock"
                        hint="Lock after no activity"
                        right={
                            <select
                                value={autoLock}
                                onChange={changeAutoLock}
                                className="rounded-lg bg-raised px-2 py-1.5 text-xs outline-none">
                                {AUTO_LOCK_OPTIONS.map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        }
                    />
                    <Row icon={Lock} label="Lock now" onClick={lock} />
                </Group>
                <Group title="Tools">
                    <Row
                        icon={KeyRound}
                        label="Password generator"
                        onClick={() => navigate("/generator")}
                        right={
                            <ChevronRight size={16} className="text-muted" />
                        }
                    />
                </Group>
                <Group title="Backup">
                    <Row
                        icon={Download}
                        label="Export backup"
                        hint="Encrypted file, needs your master password"
                        onClick={handleExport}
                    />
                    <Row
                        icon={Upload}
                        label="Import backup"
                        hint="Replaces the current vault"
                        onClick={() => fileRef.current?.click()}
                    />
                    <Row
                        icon={ExternalLink}
                        label="Open in a tab"
                        hint="Use this if importing closes the popup"
                        onClick={() =>
                            chrome.tabs.create({
                                url: chrome.runtime.getURL("index.html"),
                            })
                        }
                    />
                    <input
                        ref={fileRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={(e) => {
                            setPendingFile(e.target.files?.[0] || null);
                            e.target.value = "";
                        }}
                    />
                </Group>
                <Group title="Danger zone">
                    <Row
                        icon={Trash2}
                        label="Erase vault"
                        hint="Deletes all logins from this device"
                        danger
                        onClick={() => setEraseOpen(true)}
                    />
                </Group>
                <p className="pb-2 text-center text-xs text-muted">
                    Version {chrome.runtime.getManifest().version}. Your data is
                    encrypted and stays on this device.
                </p>
            </main>
            <ConfirmDialog
                open={Boolean(pendingFile)}
                title="Replace your vault?' message='Importing replcase your current vault with teh backup. You will unlock it with the backup's master password."
                confirmLabel="Import"
                danger
                onConfirm={handleImport}
                onCancle={() => setPendingFile(null)}
            />
            <ConfirmDialog
                open={eraseOpen}
                title="Erase vault?"
                message="All saved logins will be permanently deleted from this device. Export a backup first if you might need them."
                confirmLabel="Erase everything"
                danger
                onConfirm={handleErase}
                onCancle={() => setEraseOpen(false)}
            />
        </div>
    );
}
