import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { openVaultWithKey, saveVault } from "../lib/vault";
import { touchSession } from "../lib/session";

const VaultContext = createContext(null);

export function useVault() {
    return useContext(VaultContext);
}

export function VaultProvider({ initialVault, cryptoKey, onLock, children }) {
    const [vault, setVault] = useState(initialVault);
    const lastIv = useRef(null);

    const persist = useCallback(
        async (next) => {
            lastIv.current = await saveVault(next, cryptoKey);
            setVault(next);
            touchSession();
        },
        [cryptoKey],
    );

    useEffect(() => {
        function onChanged(changes, area) {
            if (area !== "local" || !changes.vault) return;
            if (changes.vault.newValue?.iv === lastIv.current) return;
            openVaultWithKey(cryptoKey)
                .then(setVault)
                .catch(() => {});
        }
        chrome.storage.onChanged.addListener(onChanged);
        return () => chrome.storage.onChanged.removeListener(onChanged);
    }, [cryptoKey]);

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
                        i.id === id
                            ? { ...i, ...data, updatedAt: Date.now() }
                            : i,
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
