import { useState } from "react";
import { FieldError } from "react-hook-form";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: FieldError;
    }

    export function TextInput({ label, error, type = "text", ...props }: Props) {
    const [show, setShow] = useState(false);

    // password の場合は type を切り替え
    const inputType = type === "password" ? (show ? "text" : "password") : type;

    return (
        <div className="flex flex-col gap-1 relative">
        {label && <label className="text-sm font-medium">{label}</label>}

        <div className="relative">
            <input
            {...props}
            type={inputType}
            className={`border p-2 rounded w-full pr-10 ${
                error ? "border-red-500" : "border-gray-300"
            }`}
            />

            {type === "password" && (
            <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShow(!show)}
            >
                {show ? "👁️" : "👁️‍🗨️"}
            </button>
            )}
        </div>

        {error && (
            <p className="text-sm text-red-500">{error.message}</p>
        )}
        </div>
    );
}
