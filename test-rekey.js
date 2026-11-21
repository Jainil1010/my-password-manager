import {
    decryptWithKey,
    deriveVaultKey,
    encryptWithKey,
    fromBase64,
    KDF_ITERATIONS,
    randomBytes,
    toBase64,
} from "./src/lib/crypto.js";
import { rekeyRecord } from "./src/lib/rekey.js";

const vault = {
    items: [
        { id: "1", site: "example.com", username: "me", password: "secret" },
    ],
};
const salt = randomBytes(16);
const key = await deriveVaultKey("old-master-password", salt);
const record = {
    version: 1,
    kdf: { name: "PBKDF2", iterations: KDF_ITERATIONS, salt: toBase64(salt) },
    ...(await encryptWithKey(JSON.stringify(vault), key)),
};
const { record: next, key: newKey } = await rekeyRecord(
    record,
    "old-master-password",
    "brand-new-master-password",
);
console.log("salt changed: ", next.kdf.salt !== record.kdf.salt);
console.log("iv changed: ", next.iv !== record.iv);
console.log("data changed: ", next.data !== record.data);
console.log("version kept: ", next.version === 1);
try {
    await rekeyRecord(record, "WRONG-password-123", "whatever-password-1");
} catch (e) {
    console.log("wrong current password: ", e.message);
}
const oldKeyOnNew = await deriveVaultKey(
    "old-master-password",
    fromBase64(next.kdf.salt),
);
try {
    await decryptWithKey(next, oldKeyOnNew);
    console.log("PROBLEM: old password still works");
} catch {
    console.log("old password rejected: true");
}
