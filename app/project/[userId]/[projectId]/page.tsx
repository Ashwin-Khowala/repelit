"use client";

import { MonacoEditor } from "@/components/Editor";
import { PsudoTerminal } from "@/components/PsudoTerminal";
import { useParams } from "next/navigation";
import { useSocket } from "@/hooks/useSocket";
import { Socket } from "socket.io-client";
import { useEffect, useState } from "react";
// import { socket } from "../../../../socket"
// import SplitPane from "react-split-pane";

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

  // const [isConnected, setIsConnected] = useState(false);
  // const [transport, setTransport] = useState("N/A");

  // useEffect(() => {
  //   if (socket.connected) {
  //     onConnect();
  //   }
  //   socket.on("connect", onConnect);
  //   socket.on("disconnect", () => {
  //     setIsConnected(false);
  //     setTransport("N/A");
  //   });
  //   socket.on("connect_error", (error) => {
  //     console.error("Connection error:", error);
  //   });
  //   socket.on("connect_timeout", (timeout) => {
  //     console.error("Connection timeout:", timeout);
  //   });
  //   socket.on("reconnect", (attempt) => {
  //     console.log("Reconnected after", attempt, "attempts");
  //   });
  //   socket.on("reconnect_attempt", (attempt) => {
  //     console.log("Reconnecting attempt:", attempt);
  //   });
  //   socket.on("reconnect_error", (error) => {
  //     console.error("Reconnection error:", error);
  //   });
  //   socket.on("reconnect_failed", () => {
  //     console.error("Reconnection failed");
  //   });
  //   function onConnect() {
  //     setIsConnected(true);
  //     if (socket && socket.io && socket.io.engine) {
  //       setTransport(socket.io.engine.transport.name);
  //     }
  //   }

  //   return () => {
  //     socket.off("connect", onConnect);
  //     socket.off("disconnect");
  //     socket.off("connect_error");
  //     socket.off("connect_timeout");
  //     socket.off("reconnect");
  //     socket.off("reconnect_attempt");
  //     socket.off("reconnect_error");
  //     socket.off("reconnect_failed");
  //   };
  // },[]);


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
