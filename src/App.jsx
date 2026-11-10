import { useEffect, useState } from "react";
import Vault from "./components/Vault.jsx";
import CreateVault from "./components/CreateVault.jsx";
import Unlock from "./components/Unlock.jsx";
import { openVaultWithKey, vaultExists } from "./lib/vault.js";
import { getSession, removeSession, setSession, touchSession } from "./lib/session.js";

export default function App() {
    const [screen, setScreen] = useState("loading");
    const [vault, setVault] = useState(null);
    const [cryptoKey, setCryptoKey] = useState(null);

    useEffect(() => {
        async function init() {
            if (!(await vaultExists())) return setScreen("create");
            const sessionKey = await getSession();
            if (sessionKey) {
                try {
                    const v = await openVaultWithKey(sessionKey);
                    setCryptoKey(sessionKey);
                    setVault(v);
                    return setScreen("vault");
                } catch {
                    await removeSession();
                }
            }
            setScreen("unlock");
            touchSession()
        }
        init();
    }, []);

    async function handleUnlocked(key, v) {
        await setSession(key);
        setCryptoKey(key);
        setVault(v);
        setScreen("vault");
    }

    async function handleLock() {
        await removeSession();
        setCryptoKey(null);
        setVault(null);
        setScreen("unlock");
    }

    if (screen === "loading") return <p className="p-4">Loading...</p>;
    if (screen === "create") return <CreateVault onCreated={handleUnlocked} />;
    if (screen === "unlock") return <Unlock onUnlocked={handleUnlocked} />;

    return (
        <Vault
            vault={vault}
            setVault={setVault}
            cryptoKey={cryptoKey}
            onLock={handleLock}
        />
    );
}
