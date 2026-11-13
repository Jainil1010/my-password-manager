import GeneratorPanel from "../ui/GeneratorPanel";
import ScreenHeader from "../ui/ScreenHeader";
import { useToast } from "../ui/Toast";

export default function GeneratorScreen() {
    const toast = useToast();
    return (
        <div className="flex h-full animate-fade-in flex-col">
            <ScreenHeader title="Password generator" />
            <main className="flex-1 overflow-y-auto p-3">
                <GeneratorPanel
                    useLabel="Copy password"
                    onUse={async (password) => {
                        await navigator.clipboard.writeText(password);
                        toast("Password copied");
                    }}
                />
            </main>
        </div>
    );
}
