"use client";

import { MonacoEditor } from "@/components/Editor";
import { PsudoTerminal } from "@/components/PsudoTerminal";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";


export default function EditorPage({
  language,
}: {
  language: 'Java' | 'Python' | 'JavaScript' | 'C++' | 'C#' | 'Go' | 'Rust' | 'PHP' | 'Ruby' | 'Swift' | 'Kotlin' | 'TypeScript';
}) {

  const { userId, projectId }: {
    userId: string;
    projectId: string;
  } = useParams() as any;

  const socket: Socket | null = useSocket(userId, projectId);

  if (!socket) {
    return <div>Loading...</div>;
  }


  return (
    <div className="flex h-screen">
      <div className="w-[15vw] resize-x overflow-auto border-r rounded-md"></div>
      <div className="w-[50vw] h-screen resize-x overflow-auto border-x rounded-md">
        <MonacoEditor language={language} />
      </div>
      <div className="w-[35vw] h-screen resize-x overflow-auto border-l rounded-md">
        <PsudoTerminal socket={socket} />
      </div>
    </div>
  );
}
