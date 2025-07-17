import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import path from "path";
import { saveToAzure } from "./azure";
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { TerminalManager } from "./pseudo-terminal";

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
    console.log("🚀 Initializing WebSocket server...");
    
    const io = new Server(httpServer, {
        cors: {
            // Should restrict this more!
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    console.log("✅ Socket.IO server created");

    io.on("connection", async (socket) => {
        console.log("🔌 New socket connection established:", socket.id);
        
        try {
            // Auth checks should happen here
            const host = socket.handshake.headers.host;
            console.log("🌐 Host header:", host);
            
            if (!host) {
                console.log("❌ No host header found, disconnecting");
                socket.disconnect();
                return;
            }
            
            const replId = host.split('.')[0];
            console.log(` replId is ${replId}`);
            console.log(` host is ${host}`);

            if (replId == "" || replId === "undefined") {
                console.log("No replId found in the host header, disconnecting socket");
                socket.disconnect();
                terminalManager.kill(socket.id);
                return;
            }

            console.log("📁 Fetching root directory...");
            const rootContent = await fetchDir("/workspace", "");
            console.log("📤 Emitting loaded event with root content");
            
            socket.emit("loaded", {
                rootContent: rootContent
            });
            
            console.log("⚡ Initializing socket handlers...");
            initHandlers(socket, replId);
            console.log("✅ Socket setup complete for replId:", replId);
            
        } catch (error) {
            console.error("💥 Error in connection handler:", error);
            socket.disconnect();
        }
    });

    // Add error handling for the server itself
    io.on("error", (error) => {
        console.error("🚨 Socket.IO server error:", error);
    });

    console.log("🎯 WebSocket server initialization complete");
}

function initHandlers(socket: Socket, replId: string) {
    console.log("🔧 Setting up handlers for socket:", socket.id);
    
    try {
        socket.on("disconnect", (reason) => {
            console.log("👋 User disconnected:", socket.id, "Reason:", reason);
            terminalManager.kill(socket.id);
        });

        socket.on("fetchDir", async (dir: string, callback) => {
            console.log("fetchDir requested for:", dir);
            try {
                const dirPath = `/workspace/${dir}/`;
                const contents = await fetchDir(dirPath, dir);
                console.log("📂 fetchDir response for", dir, "items:", contents?.length || 0);
                callback(contents);
            } catch (error) {
                console.error("❌ Error in fetchDir:", error);
                callback({ error: "Failed to fetch directory" });
            }
        });

        socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
            console.log("📄 fetchContent requested for:", filePath);
            try {
                const fullPath = `/workspace/${filePath}`;
                const data = await fetchFileContent(fullPath);
                console.log("📄 fetchContent response for", filePath, "length:", data?.length || 0);
                callback(data);
            } catch (error) {
                console.error("❌ Error in fetchContent:", error);
                callback({ error: "Failed to fetch file content" });
            }
        });

        // TODO: contents should be diff, not full file
        // Should be validated for size
        // Should be throttled before updating S3 (or use an S3 mount)
        socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
            console.log("updateContent requested for:", filePath, "length:", content?.length || 0);
            try {
                const fullPath = `/workspace/${filePath}`;
                await saveFile(fullPath, content);
                await saveToAzure(`code/${replId}`, filePath, content);
                console.log("✅ updateContent completed for:", filePath);
            } catch (error) {
                console.error("❌ Error in updateContent:", error);
            }
        });

        socket.on("requestTerminal", async () => {
            console.log("🖥️ requestTerminal requested for socket:", socket.id);
            try {
                terminalManager.createPty(socket.id, replId, (data: string) => {
                    socket.emit('terminal', {
                        data: Buffer.from(data, "utf-8")
                    });
                });
                console.log("✅ Terminal created for socket:", socket.id);
            } catch (error) {
                console.error("❌ Error creating terminal:", error);
            }
        });

        socket.on("terminalData", async ({ data }: { data: string, terminalId: number }) => {
            console.log("⌨️ terminalData received, length:", data?.length || 0);
            try {
                terminalManager.write(socket.id, data);
            } catch (error) {
                console.error("❌ Error writing to terminal:", error);
            }
        });

        // Add a catch-all event listener for debugging
        socket.onAny((eventName, ...args) => {
            console.log("🎪 Socket event received:", eventName, "args:", args.length);
        });

        console.log("✅ All handlers set up for socket:", socket.id);
        
    } catch (error) {
        console.error("💥 Error initializing socket handlers:", error);
        socket.disconnect();
    }
}