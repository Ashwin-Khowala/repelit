const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const pty = require("node-pty");
const os = require("os");

const cors = require("cors");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000/project",
        methods: ["GET", "POST"],
    },
});

app.use(cors());

io.on("connection", (socket) => {
    const { userId, projectId } = socket.handshake.query;
    console.log(`User ${userId} connected to project ${projectId}`);

    const shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    const restrictedEnv = {
            PATH: process.env.PATH, // Limit to basic system paths
            HOME: cwd,
            USER: userId,
            PROJECT_ID: projectId
    };
    const ptyProcess = pty.spawn(shell, [], {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.env.HOME || process.env.USERPROFILE,
        env: restrictedEnv
    });

    ptyProcess.onData((data) => {
        socket.emit("terminal", { data });
    });

    socket.on("terminalData", ({ data }) => {
        ptyProcess.write(data);
    });

    socket.on("disconnect", () => {
        ptyProcess.kill();
    });

})

server.listen(3001, () => {
    console.log("Socket.Io is running on port 3001");
})
