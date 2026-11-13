import { useCallback, useEffect, useState } from "react";
import { useToast } from "./Toast";
import { generatePassword } from "../lib/generator";
import IconButton from "./IconButton";
import { Copy, RefreshCw } from "lucide-react";
import Button from "./Button";

const TYPES = [
    ["lower", "a-z"],
    ["upper", "A-Z"],
    ["digits", "0-9"],
    ["symbols", "!@#"],
];

function Colored({ text }) {
    return (
        <p className="break-all font-mono text-base leading-relaxed">
            {[...text].map((ch, i) => (
                <span
                    key={i}
                    className={
                        /\d/.test(ch)
                            ? "text-sky-400"
                            : /[^A-Za-z0-9]/.test(ch)
                              ? "text-amber-400"
                              : ""
                    }>
                    {ch}
                </span>
            ))}
        </p>
    );
}

export default function GeneratorPanel({ onUse, useLabel = "Use passwrord" }) {
    const toast = useToast();
    const [opts, setOpts] = useState({
        length: 20,
        lower: true,
        upper: true,
        digits: true,
        symbols: true,
    });
    const [password, setPassword] = useState("");

    const regenerate = useCallback(() => {
        try {
            setPassword(generatePassword(opts));
        } catch {
            setPassword("");
        }
    }, [opts]);

    useEffect(() => {
        regenerate();
    }, [regenerate]);

    function toggle(name) {
        const enabledCount = TYPES.filter(([n]) => opts[n]).length;
        if (opts[name] && enabledCount === 1) return;
        setOpts({ ...opts, [name]: !opts[name] });
    }

    async function copy() {
        await navigator.clipboard.writeText(password);
        toast("Password copied");
    }

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-2 rounded-xl bg-app p-3">
                <div className="min-w-0 flex-1">
                    <Colored text={password} />
                </div>
                <IconButton label="Generate again" onClick={regenerate}>
                    <RefreshCw size={18} />
                </IconButton>
                <IconButton label="Copy" onClick={copy}>
                    <Copy size={18} />
                </IconButton>
            </div>
            <label className="block text-sm">
                <span className="flex justify-between text-muted">
                    <span>Length</span>
                    <span className="text-fg">{opts.length}</span>
                </span>
                <input
                    type="range"
                    min="8"
                    max="64"
                    value={opts.length}
                    onChange={(e) =>
                        setOpts({ ...opts, length: Number(e.target.value) })
                    }
                    className="mt-1 w-full accent-brand"
                />
            </label>
            <div className="flex gap-2">
                {TYPES.map(([name, label]) => (
                    <button
                        key={name}
                        type="button"
                        onClick={() => toggle(name)}
                        className={`flex-1 rounded-lg px-2 py-2 font-mono text-sm transition-colors ${opts[name] ? "bg-brand/20 text-brand" : "bg-raised text-muted"}`}>
                        {label}
                    </button>
                ))}
            </div>
            <Button
                className="w-full"
                onClick={() => onUse(password)}
                disabled={!password}>
                {useLabel}
            </Button>
        </div>
    );
}
