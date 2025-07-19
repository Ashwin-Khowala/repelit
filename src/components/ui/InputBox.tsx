import { JSX, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

type InputBoxProps = {
    type: string;
    label: string;
    svg?: boolean;
};

export function InputBox({ type, label, svg }: InputBoxProps): JSX.Element {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col space-y-1 p-2 relative">
            <label htmlFor={type} className="text-gray-700 text-sm font-medium">
                {label}
            </label>
            <div className="relative">
                <input
                    type={svg && showPassword ? "text" : type}
                    id={type}
                    className="bg-[#f3f3f3] w-[25vw] h-[7vh] p-2 border border-gray-300 rounded-md focus:ring-1 outline-none pr-10"
                />
                {svg && (
                    <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                        onClick={() => setShowPassword((prev) => !prev)}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>
        </div>
    );
}