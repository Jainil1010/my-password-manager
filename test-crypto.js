import { decrypt, encrypt } from "./src/lib/crypto.js";

const payload = await encrypt("my secret note", "master-password-123");
console.log("Encrypted: ", payload);

console.log("Right password: ", await decrypt(payload, "master-password-123"));

try {
    await decrypt(payload, "wrong-password");
} catch (e) {
    console.log("wrong password: ", e.message);
}
