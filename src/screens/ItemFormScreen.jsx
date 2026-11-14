import { Navigate, useNavigate, useParams } from "react-router";
import { useToast } from "../ui/Toast";
import { useActiveTab } from "../lib/useActiveTab";
import { useVault } from "../state/VaultContext";
import { useEffect, useRef, useState } from "react";
import { hostFromSite } from "../lib/items";
import ScreenHeader from "../ui/ScreenHeader";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import { Sparkles } from "lucide-react";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";
import GeneratorPanel from "../ui/GeneratorPanel";
import { useEscape } from "../ui/useEscape";
import ConfirmDialog from "../ui/ConfirmDialog";

export default function ItemFormScreen() {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const toast = useToast();
    const tab = useActiveTab();
    const { getItem, addItem, updateItem } = useVault();
    const existing = isEdit ? getItem(id) : null;
    const [form, setForm] = useState({
        title: existing?.title || "",
        site: existing?.site || "",
        extraSites: (existing?.extraSites || []).join("\n"),
        username: existing?.username || "",
        password: existing?.password || "",
        notes: existing?.notes || "",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [genOpen, setGenOpen] = useState(false);
    const initialRef = useRef(form);
    const dirty = JSON.stringify(form) !== JSON.stringify(initialRef.current);
    const [discardOpen, setDiscardOpen] = useState(false);
    useEscape(dirty, () => setDiscardOpen(true));

    useEffect(() => {
        if (!isEdit && tab?.url && /^https?:\/\//i.test(tab.url)) {
            const host = hostFromSite(tab.url);
            setForm((f) => (f.site ? f : { ...f, site: host }));
            if (!initialRef.current.site)
                initialRef.current = { ...initialRef.current, site: host };
        }
    }, [isEdit, tab]);

    if (isEdit && !existing) return <Navigate to="/" replace />;

    const set = (name) => (e) => setForm({ ...form, [name]: e.target.value });

    async function handleSubmit(e) {
        e.preventDefault();
        const nextErrors = {};
        if (!form.site.trim()) nextErrors.site = "Website is required";
        if (!form.password) nextErrors.password = "Password is required";
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) return;
        setSaving(true);
        try {
            const data = {
                ...form,
                title: form.title.trim(),
                site: form.site.trim(),
                extraSites: form.extraSites
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                username: form.username.trim(),
            };
            if (isEdit) {
                await updateItem(id, data);
                toast("Changes saved");
                navigate(-1);
            } else {
                const item = await addItem(data);
                toast("Login added");
                navigate(`/iten/${item.id}`, { replace: true });
            }
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader
                title={isEdit ? "Edit login" : "New login"}
                escapeBack={!dirty}
            />
            <form
                onSubmit={handleSubmit}
                className="flex min-h-0 flex-1 flex-col">
                <div className="flex-1 space-y-3 overflow-y-auto p-3">
                    <Input
                        label="Title (optional)"
                        placeholder="My Github"
                        value={form.title}
                        onChange={set("title")}
                    />
                    <Input
                        label="Website"
                        placeholder="example.com"
                        value={form.site}
                        onChange={set("site")}
                        error={errors.site}
                        autoFocus={!isEdit}
                    />
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted">
                            Also use on these websites (one per line)
                        </span>
                        <textarea
                            rows={2}
                            placeholder={"login.live.com\nmicrosoftonline.com"}
                            value={form.extraSites}
                            onChange={set("extraSites")}
                            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none placeholder:text-muted/60 focus:border-brand"
                        />
                    </label>
                    <Input
                        label="Username or email"
                        value={form.username}
                        onChange={set("username")}
                        autoComplete="off"
                    />
                    <PasswordInput
                        label="Password"
                        value={form.password}
                        onChange={set("password")}
                        error={errors.password}
                        autoComplete="new-password"
                        right={
                            <button
                                type="button"
                                title="Generate passowrd"
                                onClick={() => setGenOpen(true)}
                                className="ml-2 text-brand hover:text-brand-hover">
                                <Sparkles size={18} />
                            </button>
                        }
                    />
                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted">
                            Notes
                        </span>
                        <textarea
                            rows={3}
                            value={form.notes}
                            onChange={set("notes")}
                            className="w-full resize-none rounded-xl border border-line bg-surface px-3 py-2.5 text-sm outline-none focus:border-brand"
                        />
                    </label>
                </div>
                <div className="border-t border-line p-3">
                    <Button type="submit" loading={saving} className="w-full">
                        {isEdit ? "Save changes" : "Save login"}
                    </Button>
                </div>
            </form>
            <Sheet
                open={genOpen}
                title="Generate password"
                onClose={() => setGenOpen(false)}>
                <GeneratorPanel
                    onUse={(password) => {
                        setForm((f) => ({ ...f, password }));
                        setGenOpen(false);
                    }}
                />
            </Sheet>
            <ConfirmDialog
                open={discardOpen}
                title="Discard changes?"
                message="You have unsaved changes on this login."
                confirmLabel="Discard"
                danger
                onConfirm={() => navigate(-1)}
                onCancle={() => setDiscardOpen(false)}
            />
        </div>
    );
}
