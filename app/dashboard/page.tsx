"use client";
import Button from "@/components/ui/Button";
import { Code } from "lucide-react"

export default function page() {
    return (
        <div className="flex flex-row">
            {/* SIDE BAR */}
            <div className="flex w-[15vw] flex-col bg-[#1E1E2F] h-screen">
                <div className="flex items-center m-2 ">
                    <Code className="font-semibold text-white" />
                    <h1 className="text-3xl text-white font-semibold m-1">
                        Kode-it
                    </h1>
                </div>
                <div>
                    <div>
                        <Button text="Home" />
                    </div>
                </div>
            </div>
            
            {/* MAIN CONTENT */}
            <div>
                page
            </div>
        </div>
    )
}
