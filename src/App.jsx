import { useEffect, useState } from "react";
import Vault from "./components/Vault.jsx";
import CreateVault from "./components/CreateVault.jsx";
import Unlock from "./components/Unlock.jsx";
import { openVaultWithKey, vaultExists } from "./lib/vault.js";
import {
    getSession,
    removeSession,
    setSession,
    touchSession,
} from "./lib/session.js";
import { ToastProvider } from "./ui/Toast.jsx";
import { ShieldCheck } from "lucide-react";
import { VaultProvider } from "./state/VaultContext.jsx";
import { MemoryRouter } from "react-router";
import AppRoutes from "./AppRoutes.jsx";

export default function App() {
    const [status, setStatus] = useState("loading");
    const [currentSession, setCurrentSession] = useState(null);

    useEffect(() => {
        async function init() {
            if (!(await vaultExists())) return setStatus("create");
            const sessionKey = await getSession();
            if (sessionKey) {
                try {
                    const vault = await openVaultWithKey(sessionKey);
                    touchSession();
                    setCurrentSession({ key: sessionKey, vault });
                    return setStatus("unlocked");
                } catch {
                    await removeSession();
                }
            }
            setStatus("unlock");
        }
        init();
    }, []);

    async function handleUnlocked(key, vault) {
        await setSession(key);
        setCurrentSession({ key, vault });
        setStatus("unlocked");
    }

    async function handleLock() {
        await removeSession();
        setCurrentSession(null);
        setStatus("unlock");
    }

    return (
        <ToastProvider>
            {status === "loading" && (
                <div className="grid h-full place-items-center text-brand">
                    <ShieldCheck size={60} />
                </div>
            )}
            {status === "create" && <CreateVault onCreated={handleUnlocked} />}
            {status === "unlock" && <Unlock onUnlocked={handleUnlocked} />}
            {status === "unlocked" && (
                <VaultProvider
                    initialVault={currentSession.vault}
                    cryptoKey={currentSession.key}
                    onLock={handleLock}>
                    <MemoryRouter>
                        <AppRoutes />
                    </MemoryRouter>
                </VaultProvider>
            )}
        </ToastProvider>
    );
}
