import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
    manifest_version: 3,
    name: "My Password Manager",
    version: "2.0.5",
    action: { default_popup: "index.html" },
    permissions: ["storage", "alarms", "idle", "activeTab", "scripting"],
    background: { service_worker: "src/background.js", type: "module" },
});
