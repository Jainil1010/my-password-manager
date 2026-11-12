const COLORS = [
    "bg-danger",
    "bg-danger",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-success",
    "bg-success",
];

export default function StrengthMeter({ score, label }) {
    return (
        <div>
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                    <div
                        key={n}
                        className={`h-1.5 flex-1 rounded-full ${n <= score ? COLORS[score] : "bg-raised"}`}
                    />
                ))}
            </div>
            <p className="mt-1 h-4 text-sm text-muted">{label}</p>
        </div>
    );
}
