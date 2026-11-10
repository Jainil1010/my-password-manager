import { useState } from "react";
import { touchSession } from "../lib/session.js";

export default function ItemRow({ item, onEdit, onDelete }) {
    const [visible, setVisible] = useState(false);
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        touchSession()
        await navigator.clipboard.writeText(item.password)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }

    return (
        <li className="border rounded p-2 space-y-1">
            <div className="flex justify-between">
                <div>
                    <p className="font-medium">{item.site}</p>
                    <p className="text-sm text-gray-600">{item.username}</p>
                </div>
                <div className="space-x-2 text-sm">
                    <button onClick={onEdit}>Edit</button>
                    <button className="text-red-600" onClick={onDelete}>
                        Delete
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
                <span className="font-mono flex-1 truncate">
                    {visible ? item.password : "**********"}
                </span>
                <button onClick={() => setVisible(!visible)}>
                    {visible ? "Hide" : "Show"}
                </button>
                <button onClick={handleCopy}>
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
        </li>
    );
}
