import { X } from "lucide-react";
import IconButton from "./IconButton";
import { useEscape } from "./useEscape";

export default function Sheet({ open, title, onClose, children }) {
    useEscape(open, onClose)
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-40 flex items-end bg-black/60"
            onClick={onClose}>
            <div
                role="dialog"
                className="max-h-[90%] w-full overflow-y-auto rounded-t-2xl bg-surface p-4"
                onClick={(e) => e.stopPropagation()}>
                <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-base font-semibold">{title}</h2>
                    <IconButton label="Close" onClick={onClose}>
                        <X size={18} />
                    </IconButton>
                </div>
                {children}
            </div>
        </div>
    );
}
