'use client';
import { useRouter } from "next/navigation";
import { JSX } from "react";

export default function Button({text}:{
    text: string
}): JSX.Element {
  const router = useRouter();
  return (
    <div className="flex cursor-pointer bg-[rgb(2,21,38)] w-full h-10 backdrop-blur-md items-center justify-center rounded-md hover:bg-[#03346E]" 
    onClick={() => router.push(`/${text.toLowerCase()}`)}>
        <h2 className="text-white font-semibold text-lg">   
            {text}
        </h2>
    </div>
  )
}
