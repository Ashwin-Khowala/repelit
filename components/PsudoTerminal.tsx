import { useEffect, useRef } from "react";
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

const OPTIONS_TERM = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    cols: 200,
    theme: {
        background: "black"
    }
};

function ab2str(buf: ArrayBuffer): string {
    return new TextDecoder().decode(new Uint8Array(buf));
}

export const PsudoTerminal = ({ socket }: { socket: Socket }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const termRef = useRef<Terminal | null>(null);

    useEffect(() => {
        if (!terminalRef.current || !socket) return;

        const term = new Terminal(OPTIONS_TERM);
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        termRef.current = term;

        const terminalHandler = ({ data }: { data: ArrayBuffer }) => {
            if (data instanceof ArrayBuffer) {
                const str = ab2str(data);
                console.log(str);
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
