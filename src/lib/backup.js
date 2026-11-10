import { removeSession } from "./session.js";
import { getData, setData } from "./storage.js";

export async function exportBackup() {
    const record = await getData("vault");
    if (!record) throw new Error("Nothign to export.");
    const blob = new Blob([JSON.stringify(record, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `password-manager-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export async function importBackup(file) {
    const record = JSON.parse(await file.text());
    const valid =
        record &&
        record.version === 1 &&
        record.kdf?.salt &&
        record.kdf?.iterations &&
        record.iv &&
        record.data;
    if (!valid) throw new Error("This is not a valid backup file.");
    await setData("vault", record);
    await removeSession();
}
