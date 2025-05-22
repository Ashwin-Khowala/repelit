"use client"
import Image from "next/image";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { GoogleButton } from "@/components/auth_buttons";


export default function Signup() {
    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="relative col-span-1 bg-white ">
                <div className="flex items-center">
                    <Image
                        src="/repelit_logo.svg"
                        alt="Replit Logo"
                        width={40}
                        height={40}
                        priority
                    />
                    <div className="text-3xl font-semibold">Repelit</div>
                </div>
                <div className="flex flex-col h-screen ">
                    <div className="text-2xl font-semibold w-full text-center mt-[10vh]">
                        Log in to your Account
                    </div>
                    <div className="flex flex-col w-full items-center mt-[2vh]">
                        <InputBox type="email" label="Email or Username" />
                        <InputBox type="password" label="Password" svg={true} />
                        <button
                            type="button"
                            className="mt-2 text-white bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-4 focus:outline-none focus:ring-[#FF9119]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2 w-[25vw]"
                        >
                            <span className="w-full">Log In</span>
                        </button>
                    </div>
                    {/* {add the different signiin buttons } */}
                    <div className="w-full flex justify-center">
                        <hr className="h-px my-4 bg-gray-200 border-0 w-lg "></hr>
                    </div>
                    <div className="w-full flex justify-center">
                        <div className="flex flex-col w-[20vw]">
                            <GoogleButton />
                        </div>
                    </div>

                    <div className="w-full text-center text-sm text-slate-700">
                        New to Repelit? <Link href='/signup' className="text-blue-600 underline">signup</Link>
                    </div>
                </div>
            </div>
            <div className="w-full content-center">
                <div className="text-slate-200 text-2xl w-[70%] text-center ml-20">
                    "Some random customer service quotes for the repelit service made by ASHWIN KHOWALA"
                </div>
            </div>
        </div>
    );
}

export function InputBox({ type, label, svg }: { type: string; label: string; svg?: boolean; }) {
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