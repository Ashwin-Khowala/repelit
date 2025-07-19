"use client"
import Image from "next/image";
import { InputBox } from "@/components/ui/InputBox";
import Link from "next/link";
import { GoogleButton } from "@/components/auth_buttons";
import { useSession } from "next-auth/react";

export default function Signup() {
    const { data: session, status } = useSession();
    if (status === "loading") {
        return <div>Loading...</div>;
    }
    if (session) {
        // If the user is already logged in, redirect them to the home page
        window.location.href = "/home";
        return null;
    }
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
                        <InputBox type="email" label="Email or Username" svg={false} />
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
