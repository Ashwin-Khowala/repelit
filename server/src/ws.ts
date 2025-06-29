import { Server, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { saveToAzure } from "./azure";
import path from "path";
import { fetchDir, fetchFileContent, saveFile } from "./fs";
import { TerminalManager } from "./pseudo-terminal";

const terminalManager = new TerminalManager();

export function initWs(httpServer: HttpServer) {
    const io = new Server(httpServer, {
        cors: {
            // Should restrict this more!
            origin: "*",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", async (socket) => {
        // Auth checks should happen here
        const host = socket.handshake.headers.host;
        console.log(`host is ${host}`);
        if(!host){
            return;
        }
        // Split the host by '.' and take the first part as replId
        const [projId, userId,code,domain, tld] = host.split('.');

        if (!projId||!userId) {
            socket.disconnect();
            terminalManager.kill(socket.id);
            return;
        }

        socket.emit("loaded", {
            rootContent: await fetchDir("/workspace", "")
        });
        const replId = userId+"/"+projId;
        initHandlers(socket, replId);
    });
}

function initHandlers(socket: Socket, replId: string) {

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });

    socket.on("fetchDir", async (dir: string, callback) => {
        const dirPath = `/workspace/${dir}`;
        const contents = await fetchDir(dirPath, dir);
        callback(contents);
    });

    socket.on("fetchContent", async ({ path: filePath }: { path: string }, callback) => {
        const fullPath = `/workspace/${filePath}`;
        const data = await fetchFileContent(fullPath);
        callback(data);
    });

    // TODO: contents should be diff, not full file
    // Should be validated for size
    // Should be throttled before updating S3 (or use an S3 mount)
    socket.on("updateContent", async ({ path: filePath, content }: { path: string, content: string }) => {
        const fullPath = `/workspace/${filePath}`;
        await saveFile(fullPath, content);
        await saveToAzure(`code/${replId}`, filePath, content);
    });

    socket.on("requestTerminal", async () => {
        terminalManager.createPty(socket.id, replId, (data: string) => {
            socket.emit('terminal', {
                data: Buffer.from(data, "utf-8")
            });
        });
    });

    socket.on("terminalData", async ({ data }: { data: string, terminalId: number }) => {
        terminalManager.write(socket.id, data);
    });

}