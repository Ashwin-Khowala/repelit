"use client";
import Link from "next/link";

export default function AppBar() {

  return (
    <div className="flex">
      <div className="flex flex-col w-[18vw] h-screen bg-[rgb(2,21,38)] backdrop-blur-md">
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 className="text-white text-2xl font-bold">KodeIt</h1>
        </div>
        <Link href="/create">
          <div className="flex items-center justify-center h-16 border-b border-gray-700 cursor-pointer hover:bg-blue-950 rounded-md" >
            <h2 className="text-white text-xl font-semibold ">
              Create New Project
            </h2>
          </div>
        </Link>
        <nav className="flex flex-col p-4 space-y-2">
          <a href="/home" className="text-white hover:bg-[#03346E] p-2 rounded-md">Home</a>
          <a href="/about" className="text-white hover:bg-[#03346E] p-2 rounded-md">About</a>
          <a href="/projects" className="text-white hover:bg-[#03346E] p-2 rounded-md">Projects</a>
        </nav>
      </div>
    </div>
  )
}
