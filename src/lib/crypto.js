const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function toBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.length; i++)
        binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export function fromBase64(str) {
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

async function deriveKey(password, salt) {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations: 600000, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        false,
        ["encrypt", "decrypt"],
    );
}

export async function encrypt(plainText, password) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await deriveKey(password, salt);
    const cipher = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(plainText),
    );
    return { salt: toBase64(salt), iv: toBase64(iv), data: toBase64(cipher) };
}

export async function decrypt(payload, password) {
    const key = await deriveKey(password, fromBase64(payload.salt));
    try {
        const plain = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: fromBase64(payload.iv) },
            key,
            fromBase64(payload.data),
        );
        return decoder.decode(plain);
    } catch {
        throw new Error("Wrong password or corrupted data");
    }
}

export const KDF_ITERATIONS = 600000;

export function randomBytes(n) {
    return crypto.getRandomValues(new Uint8Array(n));
}

export async function deriveVaultKey(
    password,
    salt,
    iterations = KDF_ITERATIONS,
) {
    const baseKey = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
        { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
        baseKey,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
    );
}

export async function encryptWithKey(plainText, key) {
    const iv = randomBytes(12);
    const cipher = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(plainText),
    );
    return { iv: toBase64(iv), data: toBase64(cipher) };
}

export async function decryptWithKey(payload, key) {
    try {
        const plain = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: fromBase64(payload.iv) },
            key,
            fromBase64(payload.data),
        );
        return decoder.decode(plain);
    } catch {
        throw new Error("Wrong password or corrupted data");
    }
}

export async function exportKey(key) {
    return toBase64(await crypto.subtle.exportKey("raw", key));
}

export async function importKey(base64) {
    return crypto.subtle.importKey(
        "raw",
        fromBase64(base64),
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"],
    );
}
