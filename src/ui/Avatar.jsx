const COLORS = [
    "#6d4aff",
    "#e5484d",
    "#f59e0b",
    "#16a34a",
    "#0ea5e9",
    "#d946ef",
    "#14b8a6",
    "#f97316",
];

function hash(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) h = h * 31 + text.charCodeAt(i) || 0;
    return Math.abs(h);
}

export default function Avatar({ name = "?", size = 40 }) {
    const clean = name.replace(/^https?:\/\//, "").replace(/^www\./, "");
    const letter = (clean[0] || "?").toUpperCase();
    const color = COLORS[hash(clean) % COLORS.length];
    return (
        <div
            className="grid shrink-0 place-items-center rounded-xl font-semibold"
            style={{
                width: size,
                height: size,
                background: `${color}33`,
                color,
                fontSize: size * 0.42,
            }}>
            {letter}
        </div>
    );
}
