import { useNavigate } from "react-router";
import { useVault } from "../state/VaultContext";
import { useToast } from "../ui/Toast";
import { useActiveTab } from "../lib/useActiveTab";
import { useMemo, useState } from "react";
import { matchItems } from "../lib/match";
import { itemName } from "../lib/items";
import { fillItemOnTab } from "../lib/autofill";
import { KeyRound, Plus, Search, Settings } from "lucide-react";
import IconButton from "../ui/IconButton";
import ItemRow from "../ui/ItemRow";
import Button from "../ui/Button";
import { useEscape } from "../ui/useEscape";

export default function HomeScreen() {
    const { items } = useVault();
    const navigate = useNavigate();
    const toast = useToast();
    const tab = useActiveTab();
    const [query, setQuery] = useState("");
    useEscape(query !== '', () => setQuery(''))
    const suggestions = useMemo(
        () => (tab?.url ? matchItems(items, tab.url) : []),
        [items, tab],
    );

    const visibleItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items
            .filter(
                (i) =>
                    !q ||
                    itemName(i).toLowerCase().includes(q) ||
                    (i.username || "").toLowerCase().includes(q) ||
                    (i.site || "").toLowerCase().includes(q),
            )
            .sort((a, b) => itemName(a).localeCompare(itemName(b)));
    }, [items, query]);

    async function handleFill(item) {
        const result = await fillItemOnTab(item, tab);
        if (!result.ok) return toast(result.message, 3500);
        if (result.waiting) return toast(result.message, 5000);
        toast("Filled");
        setTimeout(() => window.close(), 500);
    }

    return (
        <div className="flex h-full animate-fade-in flex-col">
            <header className="flex items-center gap-2 px-3 pb-2 pt-3">
                <div className="relative flex-1">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                    />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search logins"
                        autoFocus
                        className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-brand"
                    />
                </div>
                <button
                    type="button"
                    title="Add login"
                    onClick={() => navigate("/new")}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white transition-colors hover:bg-brand-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand">
                    <Plus size={20} />
                </button>
                <IconButton
                    label="Settings"
                    onClick={() => navigate("/settings")}>
                    <Settings size={20} />
                </IconButton>
            </header>
            <main className="flex-1 overflow-y-auto px-3 pb-4">
                {suggestions.length > 0 && !query && (
                    <section className="mb-3">
                        <h2 className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-muted">
                            Suggested for this site
                        </h2>
                        <ul className="space-y-1 rounded-xl border border-brand/40 bg-brand/5 p-1">
                            {suggestions.map((item) => (
                                <li key={item.id}>
                                    <ItemRow
                                        item={item}
                                        onOpen={() =>
                                            navigate(`/item/${item.id}`)
                                        }
                                        action={
                                            <Button
                                                className="px-3 py-1.5"
                                                onClick={() =>
                                                    handleFill(item)
                                                }>
                                                Fill
                                            </Button>
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    </section>
                )}

                {items.length === 0 ? (
                    <div className="mt-16 text-center">
                        <div className="mx-auto mb-3 grid h-14 place-items-center rounded-2xl bg-raised text-muted">
                            <KeyRound size={26} />
                        </div>
                        <h2 className="text-base font-semibold">
                            Your vault is empty
                        </h2>
                        <p className="mt-1 text-sm text-muted">
                            Save your first login to get started.
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => navigate("/new")}>
                            Add a login
                        </Button>
                    </div>
                ) : visibleItems.length === 0 ? (
                    <p className="mt-16 text-center text-sm text-muted">
                        No logins match "{query}".
                    </p>
                ) : (
                    <>
                        <h2 className="mb-1 px-1 text-xs font-medium uppercase tracking-wide text-muted">
                            All logins ({visibleItems.length})
                        </h2>
                        <ul>
                            {visibleItems.map((item) => (
                                <li key={item.id}>
                                    <ItemRow
                                        item={item}
                                        onOpen={() =>
                                            navigate(`/item/${item.id}`)
                                        }
                                    />
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </main>
        </div>
    );
}
