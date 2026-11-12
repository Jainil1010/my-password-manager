import { useState } from "react";
import Input from "./Input";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ right, ...props }) {
    const [show, setShow] = useState(false);
    return (
        <Input
            {...props}
            type={show ? "text" : "password"}
            right={
                <>
                    {right}
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="ml-2 text-muted hover:text-fg">
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </>
            }
        />
    );
}
