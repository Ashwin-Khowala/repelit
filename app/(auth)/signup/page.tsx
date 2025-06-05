"use client"
import { GithubButton, GoogleButton, TwitterButton } from "@/components/auth_buttons";
import Image from "next/image"
import Link from "next/link";
import { useState } from "react";
import { IoIosMail } from "react-icons/io";
import { InputBox } from "@/components/ui/InputBox";

export default function Signup() {
    const [showEmailAuth, setShowEmailAuth] = useState(false);
    return (
        <div className="grid grid-cols-2 h-screen">
            <div className="relative col-span-1 bg-white">
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
                    <div className="text-2xl font-semibold w-full text-center mt-[10vh] mb-[5vh]">
                        Create a repelit Account
                    </div>
                    {/* {add the different signiin buttons } */}
                    <div className="w-full flex justify-center">
                        <div className="flex flex-col w-[20vw]">
                            <GoogleButton />
                            <GithubButton />
                            <TwitterButton />
                            <div className="text-xs text-center">OR</div>
                            {!showEmailAuth ?
                                <button type="button" className="flex justify-center items-center gap-3 hover:bg-slate-200 rounded-lg p-2"
                                    onClick={() => {
                                        setShowEmailAuth(!showEmailAuth);
                                    }}
                                >
                                    <div className="">
                                        <IoIosMail />
                                    </div>
                                    <div className="">
                                        Email & Password
                                    </div>
                                </button>
                                :
                                <div className="flex flex-col w-full items-center mt-[2vh]">
                                    <InputBox type="email" label="Email or Username" />
                                    <InputBox type="password" label="Password" svg={true} />
                                    <button
                                        type="button"
                                        className="mt-2 text-white bg-[#FF9119] hover:bg-[#FF9119]/80 focus:ring-4 focus:outline-none focus:ring-[#FF9119]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 mb-2 w-[25vw]"
                                    >
                                        <span className="w-full">Create Account</span>
                                    </button>
                                </div>
                            }
                        </div>
                    </div>

                    <div className="w-full flex justify-center">
                        <hr className="h-px my-4 bg-gray-200 border-0 w-lg "></hr>
                    </div>
                    <div className="w-full text-center text-sm text-slate-700">
                        New to Repelit? <Link href='/signin' className="text-blue-600 underline">signin</Link>
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