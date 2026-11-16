import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest(({ mode }) => {
    const dev = mode === "development";
    const matches = [
        "https://*/*",
        ...defineManifest(dev ? ["http://localhost/*"] : []),
    ];
    return {
        manifest_version: 3,
        name: "My Password Manager",
        version: "1.2.0",
        description:
            "A simple password manager. Your data is encrypted and stays on your device.",
        action: { default_popup: "index.html" },
        permissions: ["storage", "alarms", "idle", "activeTab"],
        background: { service_worker: "src/background.js", type: "module" },
        content_scripts: [
            { matches, js: ["src/content/inline.js"], run_at: "document_idle" },
        ],
    };
});
