export default function IconButton({
    label,
    className = "",
    children,
    ...props
}) {
    return (
        <button
            type="button"
            title={label}
            {...props}
            className={`grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-raised hover:text-fg focus-visible:outline-2 focus-visible:outline-brand ${className}`}>
            {children}
        </button>
    );
}
