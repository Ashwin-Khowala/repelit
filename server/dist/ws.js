"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWs = initWs;
const socket_io_1 = require("socket.io");
const azure_1 = require("./azure");
const fs_1 = require("./fs");
const pseudo_terminal_1 = require("./pseudo-terminal");
// Remove this line - it's causing issues!
// import { console } from "inspector";
const terminalManager = new pseudo_terminal_1.TerminalManager();
function initWs(httpServer) {
    console.log("🚀 Initializing WebSocket server...");
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            // Should restrict this more!
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    console.log("✅ Socket.IO server created");
    io.on("connection", (socket) => __awaiter(this, void 0, void 0, function* () {
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
            console.log(`📋 replId is ${replId}`);
            console.log(`🏠 host is ${host}`);
            if (replId == "" || replId === "undefined") {
                console.log("❌ No replId found in the host header, disconnecting socket");
                socket.disconnect();
                terminalManager.kill(socket.id);
                return;
            }
            console.log("📁 Fetching root directory...");
            const rootContent = yield (0, fs_1.fetchDir)("/workspace", "");
            console.log("📤 Emitting loaded event with root content");
            socket.emit("loaded", {
                rootContent: rootContent
            });
            console.log("⚡ Initializing socket handlers...");
            initHandlers(socket, replId);
            console.log("✅ Socket setup complete for replId:", replId);
        }
        catch (error) {
            console.error("💥 Error in connection handler:", error);
            socket.disconnect();
        }
    }));
    // Add error handling for the server itself
    io.on("error", (error) => {
        console.error("🚨 Socket.IO server error:", error);
    });
    console.log("🎯 WebSocket server initialization complete");
}
function initHandlers(socket, replId) {
    console.log("🔧 Setting up handlers for socket:", socket.id);
    try {
        socket.on("disconnect", (reason) => {
            console.log("👋 User disconnected:", socket.id, "Reason:", reason);
            terminalManager.kill(socket.id);
        });
        socket.on("fetchDir", (dir, callback) => __awaiter(this, void 0, void 0, function* () {
            console.log("📂 fetchDir requested for:", dir);
            try {
                const dirPath = `/workspace/${dir}/`;
                const contents = yield (0, fs_1.fetchDir)(dirPath, dir);
                console.log("📂 fetchDir response for", dir, "items:", (contents === null || contents === void 0 ? void 0 : contents.length) || 0);
                callback(contents);
            }
            catch (error) {
                console.error("❌ Error in fetchDir:", error);
                callback({ error: "Failed to fetch directory" });
            }
        }));
        socket.on("fetchContent", (_a, callback_1) => __awaiter(this, [_a, callback_1], void 0, function* ({ path: filePath }, callback) {
            console.log("📄 fetchContent requested for:", filePath);
            try {
                const fullPath = `/workspace/${filePath}`;
                const data = yield (0, fs_1.fetchFileContent)(fullPath);
                console.log("📄 fetchContent response for", filePath, "length:", (data === null || data === void 0 ? void 0 : data.length) || 0);
                callback(data);
            }
            catch (error) {
                console.error("❌ Error in fetchContent:", error);
                callback({ error: "Failed to fetch file content" });
            }
        }));
        // TODO: contents should be diff, not full file
        // Should be validated for size
        // Should be throttled before updating S3 (or use an S3 mount)
        socket.on("updateContent", (_a) => __awaiter(this, [_a], void 0, function* ({ path: filePath, content }) {
            console.log("✏️ updateContent requested for:", filePath, "length:", (content === null || content === void 0 ? void 0 : content.length) || 0);
            try {
                const fullPath = `/workspace/${filePath}`;
                yield (0, fs_1.saveFile)(fullPath, content);
                yield (0, azure_1.saveToAzure)(`code/${replId}`, filePath, content);
                console.log("✅ updateContent completed for:", filePath);
            }
            catch (error) {
                console.error("❌ Error in updateContent:", error);
            }
        }));
        socket.on("requestTerminal", () => __awaiter(this, void 0, void 0, function* () {
            console.log("🖥️ requestTerminal requested for socket:", socket.id);
            try {
                terminalManager.createPty(socket.id, replId, (data) => {
                    socket.emit('terminal', {
                        data: Buffer.from(data, "utf-8")
                    });
                });
                console.log("✅ Terminal created for socket:", socket.id);
            }
            catch (error) {
                console.error("❌ Error creating terminal:", error);
            }
        }));
        socket.on("terminalData", (_a) => __awaiter(this, [_a], void 0, function* ({ data }) {
            console.log("⌨️ terminalData received, length:", (data === null || data === void 0 ? void 0 : data.length) || 0);
            try {
                terminalManager.write(socket.id, data);
            }
            catch (error) {
                console.error("❌ Error writing to terminal:", error);
            }
        }));
        // Add a catch-all event listener for debugging
        socket.onAny((eventName, ...args) => {
            console.log("🎪 Socket event received:", eventName, "args:", args.length);
        });
        console.log("✅ All handlers set up for socket:", socket.id);
    }
    catch (error) {
        console.error("💥 Error initializing socket handlers:", error);
        socket.disconnect();
    }
}
