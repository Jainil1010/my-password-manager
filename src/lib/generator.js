const SETS = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    digits: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.?",
};

function randomInt(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const buf = new Uint32Array(1);
    do {
        crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
}

export function generatePassword({
    length = 20,
    lower = true,
    upper = true,
    digits = true,
    symbols = true,
} = {}) {
    const enabled = [];
    if (lower) enabled.push(SETS.lower);
    if (upper) enabled.push(SETS.upper);
    if (digits) enabled.push(SETS.digits);
    if (symbols) enabled.push(SETS.symbols);
    if (enabled.length === 0)
        throw new Error("Pick at least one character type");
    const finalLength = Math.max(length, enabled.length);
    const chars = enabled.map((set) => set[randomInt(set.length)]);
    const pool = enabled.join("");
    while (chars.length < finalLength) chars.push(pool[randomInt(pool.length)]);
    for (let i = chars.length - 1; i > 0; i--) {
        const j = randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
}
