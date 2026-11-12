import Button from "./Button";

export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = "Confirm",
    danger = false,
    onConfirm,
    onCancle,
}) {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-6"
            onClick={onCancle}>
            <div
                role="dialog"
                className="w-full rounded-2xl bg-surface p-5"
                onClick={(e) => e.stopPropagation()}>
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-muted">{message}</p>
                <div className="mt-5 flex justify-end gap-2">
                    <Button variant="secondary" onClick={onCancle}>
                        Cancle
                    </Button>
                    <Button
                        variant={danger ? "danger" : "primary"}
                        onClick={onConfirm}>
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>
    );
}
