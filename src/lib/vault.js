import {
    decryptWithKey,
    deriveVaultKey,
    encryptWithKey,
    fromBase64,
    KDF_ITERATIONS,
    randomBytes,
    toBase64,
} from "./crypto.js";
import { getData, setData } from "./storage.js";

const VAULT_KEY = "vault";

export async function vaultExists() {
    return (await getData(VAULT_KEY)) !== null;
}

export async function createVault(masterPassword) {
    const salt = randomBytes(16);
    const key = await deriveVaultKey(masterPassword, salt);
    const vault = { items: [] };
    const encrypted = await encryptWithKey(JSON.stringify(vault), key);
    await setData(VAULT_KEY, {
        version: 1,
        kdf: {
            name: "PBKDF2",
            iterations: KDF_ITERATIONS,
            salt: toBase64(salt),
        },
        ...encrypted,
    });
    return { key, vault };
}

export async function unlockVault(masterPassword) {
    const record = await getData(VAULT_KEY);
    const key = await deriveVaultKey(
        masterPassword,
        fromBase64(record.kdf.salt),
        record.kdf.iterations,
    );
    const json = await decryptWithKey(record, key);
    return { key, vault: JSON.parse(json) };
}

export async function openVaultWithKey(key) {
    const record = await getData(VAULT_KEY);
    return JSON.parse(await decryptWithKey(record, key));
}

export async function saveVault(vault, key) {
    const record = await getData(VAULT_KEY);
    const encrypted = await encryptWithKey(JSON.stringify(vault), key);
    await setData(VAULT_KEY, { ...record, ...encrypted });
}
