// import { useEffect, useState } from "react";
// import { io, Socket } from "socket.io-client";

// export function useSocket(userId:string , projectId:string) {
//     const [socket,setSocket] = useState<Socket | null>(null);

//     useEffect(() => {
//         const newSocket = io(`http://localhost:3001/api/server`, {
//             query: {
//                 userId,
//                 projectId,
//             },
//             transports: ["websocket"],
//             autoConnect: true,
//         });
//         newSocket.on("connect", () => {
//             console.log("Connected to socket server");
//         });
//         newSocket.on("disconnect", () => {
//             console.log("Disconnected from socket server");
//         });
//         setSocket(newSocket);

//         return () => {
//             newSocket.disconnect();
//         };
//     }, [userId, projectId]);

//     return socket;

// }