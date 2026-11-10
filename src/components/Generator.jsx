import { useState } from "react";
import { generatePassword } from "../lib/generator.js";

export default function Generator({ onUse }) {
    const [length, setLength] = useState(20);
    const [opts, setOpts] = useState({
        lower: true,
        upper: true,
        digits: true,
        symbols: true,
    });
    const [password, setPassword] = useState("");

    function generate() {
        try {
            setPassword(generatePassword({ length, ...opts }));
        } catch (e) {
            setPassword("");
            alert(e.message);
        }
    }

    return (
        <div className="border rounded p-2 space-y-2 text-sm">
            <label className="block">
                Length: {length}
                <input
                    type="range"
                    min="8"
                    max="64"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                    className="w-full"
                />
            </label>
            <div className="flex flex-wrap gap-3">
                {Object.keys(opts).map((name) => (
                    <label key={name}>
                        <input
                            type="checkbox"
                            checked={opts[name]}
                            onChange={() =>
                                setOpts({ ...opts, [name]: !opts[name] })
                            }
                        />{" "}
                        {name}
                    </label>
                ))}
            </div>
            <div className="flex gap-2">
                <button className="border px-2 py-1 rounded" onClick={generate}>
                    Generate
                </button>
                <button
                    className="border px-2 py-1 rounded"
                    disabled={!password}
                    onClick={() => onUse(password)}>
                    Use
                </button>
            </div>
            {password && <p className="font-mono break-all">{password}</p>}
        </div>
    );
}
