import { forwardRef } from "react";

const Input = forwardRef(function Input(
    { label, error, right, className = "", ...props },
    ref,
) {
    return (
        <label className="block">
            {label && (
                <span className="mb-1 block text-xs font-medium text-muted">
                    {label}
                </span>
            )}
            <span
                className={`flex items-center rounded-xl border bg-surface px-3 transition-colors focus-within:border-brand ${error ? "border-danger" : "border-line"}`}>
                <input
                    ref={ref}
                    {...props}
                    className={`w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-muted/60 ${className}`}
                />
                {right}
            </span>
            {error && (
                <span className="mt-1 block text-xs text-danger">{error}</span>
            )}
        </label>
    );
});

export default Input;
