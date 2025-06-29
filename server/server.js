const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const pty = require("node-pty");
const cors = require("cors");
const os = require("os");

// Create app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.get("/", (req, res) => res.send("Terminal backend is running"));

// Socket.IO + PTY Setup
io.on("connection", (socket) => {
  console.log("Client connected");

  var shellOs = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
  // Spawn shell
  const shell = pty.spawn(shellOs, [], {
    name: "xterm-color",
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
  });

  // Send shell output to client
  shell.on("data", (data) => {
    socket.emit("terminal", { data: Buffer.from(data).buffer });
  });

  // Receive input from client
  socket.on("terminalData", ({ data }) => {
    shell.write(data);
  });

  // Resize support (optional)
  socket.on("resize", ({ cols, rows }) => {
    shell.resize(cols, rows);
  });

  socket.on("disconnect", () => {
    shell.kill();
    console.log("Client disconnected");
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`✅ Terminal server running at http://localhost:${PORT}`);
});
