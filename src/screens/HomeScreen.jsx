import { useVault } from "../state/VaultContext";

export default function HomeScreen() {
    const { items, lock } = useVault();
    return (
        <div className="p-4">
            <p>Items: {items.length}</p>
            <button className="mt-3 rounded bg-raised px-3 py-2" onClick={lock}>
                Lock
            </button>
        </div>
    );
}
