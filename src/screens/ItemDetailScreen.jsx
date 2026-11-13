import { Navigate, useNavigate, useParams } from "react-router";
import { useToast } from "../ui/Toast";
import { useActivateTab } from "../lib/useActivateTab";
import { useVault } from "../state/VaultContext";
import { useState } from "react";
import { matchItems } from "../lib/match";
import { hostFromSite, itemName, toUrl } from "../lib/items";
import { fillItemOnTab } from "../lib/autofill";
import ScreenHeader from "../ui/ScreenHeader";
import IconButton from "../ui/IconButton";
import { Copy, ExternalLink, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Avatar from "../ui/Avatar";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";

function Field({ label, children, actions }) {
    return (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-surface px-3 py-2.5">
            <div className="min-w-0">
                <p className="text-xs text-muted">{label}</p>
                <div className="truncate text-sm">{children}</div>
            </div>
            <div className="flex shrink-0 items-center">{actions}</div>
        </div>
    );
}

export default function ItemDetailScreen() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const tab = useActivateTab();
    const { getItem, deleteItem } = useVault();
    const [showPassword, setShowPassword] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);

    const item = getItem(id);
    if (!item) return <Navigate to="/" replace />;
    const canFill = tab?.url && matchItems([item], tab.url).length > 0;
    const websiteUrl = toUrl(item.site);

    async function copy(text, label) {
        await navigator.clipboard.writeText(text);
        toast(`${label} copied`);
    }

    async function handleFill() {
        const result = await fillItemOnTab(item, tab);
        if (!result.ok) return toast(result.message, 3500);
        if (result.waiting) return toast(result.message, 5000);
        toast("Filled");
        setTimeout(() => window.close(), 500);
    }

    async function handleDelete() {
        setConfirmOpen(false);
        await deleteItem(item.id);
        toast("Login deleted");
    }

    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader
                title={itemName(item)}
                actions={
                    <>
                        <IconButton
                            label="Edit"
                            onClick={() => navigate(`/edit/${item.id}`)}>
                            <Pencil size={18} />
                        </IconButton>
                        <IconButton
                            label="Delete"
                            onClick={() => setConfirmOpen(true)}>
                            <Trash2 size={18} />
                        </IconButton>
                    </>
                }
            />
            <main className="flex-1 space-y-2 overflow-y-auto p-3">
                <div className="flex flex-col items-center gap-2 py-3">
                    <Avatar name={itemName(item)} size={56} />
                    <p className="text-base font-semibold">{itemName(item)}</p>
                    <p className="text-xs text-muted">
                        {hostFromSite(item.site)}
                    </p>
                </div>
                {canFill && (
                    <Button className="w-full" onClick={handleFill}>
                        Fill on this page
                    </Button>
                )}
                {item.username && (
                    <Field
                        label="Username"
                        actions={
                            <IconButton
                                label="Copy username"
                                onClick={() => copy(item.username, "Username")}>
                                <Copy size={17} />
                            </IconButton>
                        }>
                        {item.username}
                    </Field>
                )}
                <Field
                    label="Password"
                    actions={
                        <>
                            <IconButton
                                label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                                onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? (
                                    <EyeOff size={17} />
                                ) : (
                                    <Eye size={17} />
                                )}
                            </IconButton>
                            <IconButton
                                label="Copy password"
                                onClick={() => copy(item.password, "Password")}>
                                <Copy size={17} />
                            </IconButton>
                        </>
                    }>
                    <span className="font-mono">
                        {showPassword ? item.password : "************"}
                    </span>
                </Field>
                <Field
                    label="Website"
                    actions={
                        websiteUrl && (
                            <IconButton
                                label="Open website"
                                onClick={() =>
                                    chrome.tabs.create({ url: websiteUrl })
                                }>
                                <ExternalLink size={17} />
                            </IconButton>
                        )
                    }>
                    {hostFromSite(item.site)}
                </Field>
                {item.notes && (
                    <div className="rounded-xl bg-surface px-3 py-2.5">
                        <p className="text-xs text-muted">Notes</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm">
                            {item.notes}
                        </p>
                    </div>
                )}
                <p className="pt-2 text-center text-xs text-muted">
                    Updated {new Date(item.updatedAt).toLocaleString()}
                </p>
            </main>
            <ConfirmDialog
                open={confirmOpen}
                title="Delete this login?"
                message="This cannot be undone. Make sure you have a backup if you need it."
                confirmLabel="Delete"
                danger
                onConfirm={handleDelete}
                onCancle={() => setConfirmOpen(false)}
            />
        </div>
    );
}
