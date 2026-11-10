import { exportBackup, importBackup } from "../lib/backup.js";

export default function Backup({ onImported }) {
    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!window.confirm("This replaces your current vault. Continue?"))
            return;
        try {
            await importBackup(file);
            onImported();
        } catch (err) {
            alert(err.message);
        }
    }
    return (
        <div className="flex gap-2 text-sm">
            <button className="border px-2 py-1 rounded" onClick={exportBackup}>
                Export backup
            </button>
            <label className="border px-2 py-1 rounded cursor-pointer">
                Import
                <input
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={handleFile}
                />
            </label>
        </div>
    );
}
