import {
    decryptWithKey,
    deriveVaultKey,
    encryptWithKey,
    fromBase64,
    KDF_ITERATIONS,
    randomBytes,
    toBase64,
} from "./crypto.js";

export async function rekeyRecord(record, currentPassword, newPassword) {
    const oldKey = await deriveVaultKey(
        currentPassword,
        fromBase64(record.kdf.salt),
        record.kdf.iterations,
    );
    const plain = await decryptWithKey(record, oldKey);
    const salt = randomBytes(16);
    const key = await deriveVaultKey(newPassword, salt, KDF_ITERATIONS);
    const encrypted = await encryptWithKey(plain, key);
    const next = {
        ...record,
        kdf: {
            name: "PBKDF2",
            iterations: KDF_ITERATIONS,
            salt: toBase64(salt),
        },
        ...encrypted,
    };
    await decryptWithKey(next, key);
    return { record: next, key, vault: JSON.parse(plain) };
}
