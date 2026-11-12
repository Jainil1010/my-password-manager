const variants = {
    primary: "bg-brand text-white hover:bg-brand-hover",
    secondry: "bg-raised text-fg hover:bg-line",
    ghost: "text-muted hover:bg-raised hover:text-fg",
    danger: "bg-danger/15 text-danger hover:bg-danger/25",
};

export default function Button({
    variant = "primary",
    type = "button",
    loading = false,
    className = "",
    children,
    ...props
}) {
    return (
        <button
            type={type}
            {...props}
            disabled={props.disabled || loading}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>
            {loading ? "Please wait..." : children}
        </button>
    );
}
