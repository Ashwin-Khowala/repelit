"use client";

import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm"; 
import { FitAddon } from "@xterm/addon-fit"; 

// import "xterm/css/xterm.css"; 

const OPTIONS_TERM = {
  cursorBlink: true,
  cols: 200,
  theme: {
    background: "#000000", // use hex for better consistency
  },
};

function ab2str(buf: ArrayBuffer): string {
  return new TextDecoder().decode(new Uint8Array(buf));
}

export const PsudoTerminal = ({ socket }: { socket: Socket }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);

  useEffect(() => {
    if (!terminalRef.current || !socket) return;

    const term = new Terminal(OPTIONS_TERM);
    const fitAddon = new FitAddon();
    fitAddonRef.current = fitAddon;

    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    termRef.current = term;

    // Optional: resize observer to keep it responsive
    const resizeObserver = new ResizeObserver(() => {
      fitAddon.fit();
    });
    resizeObserver.observe(terminalRef.current);

    const terminalHandler = ({ data }: { data: ArrayBuffer }) => {
      if (data instanceof ArrayBuffer) {
        const str = ab2str(data);
        term.write(str);
      }
    };

    socket.emit("requestTerminal");
    socket.on("terminal", terminalHandler);

    term.onData((data) => {
      socket.emit("terminalData", { data });
    });

    socket.emit("terminalData", { data: "\n" });

    return () => {
      socket.off("terminal", terminalHandler);
      resizeObserver.disconnect();
      term.dispose();
    };
  }, [socket]);

  return (
    <div
      ref={terminalRef}
      style={{ width: "100%", height: "400px", textAlign: "left" }}
    />
  );
};
