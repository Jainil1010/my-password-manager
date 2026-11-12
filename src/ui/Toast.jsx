import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

const ToastContext = createContext(() => {});

export function useToast() {
    return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [message, setMessage] = useState(null);
    const timer = useRef(null);

    const show = useCallback((text, ms = 1800) => {
        setMessage(text);
        clearTimeout(timer.current);
        timer.current = setTimeout(() => setMessage(null), ms);
    }, []);

    return (
        <ToastContext.Provider value={show}>
            {children}
            {message && (
                <div
                    role="status"
                    className="pointer-events-none fixed bottom-4 left-1/2 z-50 max-w-[320px] -translate-x-1/2 rounded-full bg-raised px-4 py-2 text-center text-sm shadow-lh">
                    {message}
                </div>
            )}
        </ToastContext.Provider>
    );
}
