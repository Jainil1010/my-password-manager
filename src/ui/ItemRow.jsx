import Avatar from "./Avatar";
import { itemName } from "../lib/items";

export default function ItemRow({ item, onOpen, action }) {
    return (
        <div className="flex items-center gap-1 rounded-xl p-2 hover:bg-surface">
            <button
                type="button"
                onClick={onOpen}
                className="flex min-w-0 flex-1 items-center gap-3 text-left">
                <Avatar name={itemName(item)} />
                <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">
                        {itemName(item)}
                    </span>
                    <span className="block truncate text-xs text-muted">
                        {item.username || "No username"}
                    </span>
                </span>
            </button>
            {action}
        </div>
    );
}
