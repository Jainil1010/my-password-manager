export default function Switch({ checked, onChange, label }) {
    return (
        <button
            type="button"
            role="switch"
            onClick={() => onChange(!checked)}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-brand" : "bg-line"}`}>
            <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? "left-5.5" : "left-0.5"}`}
            />
        </button>
    );
}
