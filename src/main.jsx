import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/inter";
import "./index.css";
import App from "./App.jsx";
import { ToastProvider } from "./ui/Toast";
import { MemoryRouter } from "react-router";
import TestScreen from "./screens/TestScreen.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ToastProvider>
            <MemoryRouter>
                <TestScreen />
            </MemoryRouter>
        </ToastProvider>
    </StrictMode>,
);
