import { useState } from "react";
import { Settings } from "lucide-react";
import Button from "../ui/Button";
import IconButton from "../ui/IconButton";
import Input from "../ui/Input";
import PasswordInput from "../ui/PasswordInput";
import Avatar from "../ui/Avatar";
import ConfirmDialog from "../ui/ConfirmDialog";
import Sheet from "../ui/Sheet";
import ScreenHeader from "../ui/ScreenHeader";
import { useToast } from "../ui/Toast";

export default function TestScreen() {
    const toast = useToast();
    const [dialog, setDialog] = useState(false);
    const [sheet, setSheet] = useState(false);

    return (
        <div className="flex h-full flex-col">
            <ScreenHeader
                title="Test Screen"
                back={false}
                actions={
                    <IconButton label="Settings">
                        <Settings size={20} />
                    </IconButton>
                }
            />
            <div className="flex-1 space-y-3 overflow-y-auto p-3">
                <div className="flex gap-2">
                    <Button>Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="danger">Danger</Button>
                </div>
                <Input label="Website" placeholder="example.com" />
                <Input label="With error" error="This field is required" />
                <PasswordInput label="Password" placeholder="Type a password" />
                <div className="flex gap-3">
                    <Avatar name="github.com" />
                    <Avatar name="google.com" />
                    <Avatar name="amazon.com" />
                    <Avatar name="x.com" />
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => toast("Copied")}>
                        Toast
                    </Button>
                    <Button variant="secondary" onClick={() => setDialog(true)}>
                        Dialog
                    </Button>
                    <Button variant="secondary" onClick={() => setSheet(true)}>
                        Sheet
                    </Button>
                </div>
            </div>
            <ConfirmDialog
                open={dialog}
                title="Delete this login?"
                message="This cannot be undone."
                confirmLabel="Delete"
                danger
                onConfirm={() => setDialog(false)}
                onCancel={() => setDialog(false)}
            />
            <Sheet open={sheet} title="A sheet" onClose={() => setSheet(false)}>
                <p className="text-sm text-muted">
                    Bottom sheets are good for small tasks, like the generator.
                </p>
            </Sheet>
        </div>
    );
}
