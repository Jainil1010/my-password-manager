import { getSession } from "./session";
import { openVaultWithKey } from "./vault";

export async function getUnlockedVault() {
    const key = await getSession();
    if (!key) return null;
    try {
        return { key, vault: await openVaultWithKey(key) };
    } catch {
        return null;
    }
}
