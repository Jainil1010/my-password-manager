import { generatePassword } from "./src/lib/generator.js";

console.log(generatePassword());
console.log(generatePassword({ length: 12, symbols: false }));
console.log(generatePassword({ length: 32 }));
for (let i = 0; i < 1000; i++) {
    const p = generatePassword({ length: 10 });
    if (
        !/[a-z]/.test(p) ||
        !/[A-Z]/.test(p) ||
        !/[0-9]/.test(p) ||
        !/[^a-zA-Z0-9]/.test(p)
    )
        throw new Error("Bad password: " + p);
}
console.log("OK");
