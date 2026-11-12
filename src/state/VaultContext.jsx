import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { saveVault } from "../lib/vault";
import { touchSession } from "../lib/session";

const VaultContext = createContext(null);

export function useVault() {
    return useContext(VaultContext);
}

export function VaultProvider({ initialVault, cryptoKey, onLock, children }) {
    const [vault, setVault] = useState(initialVault);

    const persist = useCallback(
        async (next) => {
            await saveVault(next, cryptoKey);
            setVault(next);
            touchSession();
        },
        [cryptoKey],
    );

    const api = useMemo(
        () => ({
            items: vault.items,
            getItem: (id) => vault.items.find((i) => i.id === id) || null,

            async addItem(data) {
                const now = Date.now();
                const item = {
                    id: crypto.randomUUID(),
                    title: "",
                    notes: "",
                    ...data,
                    createdAt: now,
                    updatedAt: now,
                };
                await persist({ ...vault, items: [item, ...vault.items] });
                return item;
            },

            async updateItem(id, data) {
                await persist({
                    ...vault,
                    items: vault.items.map((i) =>
                        i.id === id ? { ...i, data, updatedAt: Date.now() } : i,
                    ),
                });
            },

            async deleteItem(id) {
                await persist({
                    ...vault,
                    items: vault.items.filter((i) => i.id !== id),
                });
            },
            lock: onLock,
        }),
        [vault, persist, onLock],
    );

    return (
        <VaultContext.Provider value={api}>{children}</VaultContext.Provider>
    );
}
