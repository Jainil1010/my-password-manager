import { useNavigate } from "react-router";
import IconButton from "./IconButton";
import { ChevronLeft } from "lucide-react";

export default function ScreenHeader({ title, back = true, actions }) {
    const navigate = useNavigate();
    return (
        <header className="flex h-14 shrink-0 items-center gap-1 border-b border-line px-2">
            {back && (
                <IconButton label="Back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                </IconButton>
            )}
            <h1 className="flex-1 truncate px-1 text-base font-semibold">
                {title}
            </h1>
            <div className="flex items-center">{actions}</div>
        </header>
    );
}
