// import { useEffect, useRef } from "react"
// import { Socket } from "socket.io-client";
// import { Terminal } from "@xterm/xterm";
// import { FitAddon } from '@xterm/addon-fit';
// import '@xterm/xterm/css/xterm.css';

// function ab2str(buf: ArrayBuffer | string): string {
//     if (typeof buf === 'string') {
//         return buf;
//     }
//     return String.fromCharCode(...new Uint8Array(buf));
// }

// const OPTIONS_TERM = {
//     useStyle: true,
//     screenKeys: true,
//     cursorBlink: true,
//     cols: 200,
//     fontSize: 13,
//     fontFamily: '"Menlo for Powerline", Menlo, Consolas, "Liberation Mono", Courier, monospace',
//     theme: {
//         foreground: '#d2d2d2',
//         background: '#2b2b2b',
//         cursor: '#adadad',
//         black: '#000000',
//         red: '#d81e00',
//         green: '#5ea702',
//         yellow: '#cfae00',
//         blue: '#427ab3',
//         magenta: '#89658e',
//         cyan: '#00a7aa',
//         white: '#dbded8',
//         brightBlack: '#686a66',
//         brightRed: '#f54235',
//         brightGreen: '#99e343',
//         brightYellow: '#fdeb61',
//         brightBlue: '#84b0d8',
//         brightMagenta: '#bc94b7',
//         brightCyan: '#37e6e8',
//         brightWhite: '#f1f1f0'
//     }
// };
// // const OPTIONS_TERM = {
// //     useStyle: true,
// //     screenKeys: true,
// //     cursorBlink: true,
// //     cols: 200,
// //     theme: {
// //         background: "black",
// //         foreground: "white",
// //         cursor: "white",
// //         selection: "rgba(255, 255, 255, 0.3)"
// //     },
// //     fontSize: 14,
// //     fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
// // };

// export const TerminalComponent = ({ socket }: { socket: Socket }) => {
//     const terminalRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         if (!terminalRef.current || !socket) {
//             return;
//         }

//         let term: Terminal;
//         let fitAddon: FitAddon;

//         // Initialize terminal only on client side
//         if (typeof window !== 'undefined') {
//             fitAddon = new FitAddon();
//             term = new Terminal(OPTIONS_TERM);

//             const terminalHandler = ({ data }: { data: ArrayBuffer | string }) => {
//                 if (data && term) {
//                     const stringData = ab2str(data);
//                     console.log('Terminal data:', stringData);
//                     term.write(stringData);
//                 }
//             };

//             socket.emit("requestTerminal");
//             socket.on("terminal", terminalHandler);

//             term.loadAddon(fitAddon);
//             term.open(terminalRef.current);
//             fitAddon.fit();

//             term.onData((data: string) => {
//                 socket.emit('terminalData', { data });
//             });

//             socket.emit('terminalData', { data: '\n' });

//             // Handle window resize
//             const handleResize = () => {
//                 if (fitAddon) {
//                     fitAddon.fit();
//                 }
//             };

//             window.addEventListener('resize', handleResize);

//             return () => {
//                 socket.off("terminal", terminalHandler);
//                 window.removeEventListener('resize', handleResize);
//                 if (term) {
//                     term.dispose();
//                 }
//             };
//         }
//     }, [socket]);

//     return (
//         <div
//             style={{ width: "40vw", height: "400px", textAlign: "left" }}
//             ref={terminalRef}
//         />
//     );
// };


import { useEffect, useRef } from "react"
import { Socket } from "socket.io-client";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

function ab2str(buf: ArrayBuffer | string): string {
    if (typeof buf === 'string') {
        return buf;
    }
    return String.fromCharCode(...new Uint8Array(buf));
}

const MODERN_TERMINAL_OPTIONS = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    cursorStyle: "bar" as "bar",
    cols: 120,
    fontSize: 14,
    fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    lineHeight: 1.4,
    letterSpacing: 0,
    theme: {
        foreground: '#e4e4e7',
        background: '#09090b',
        cursor: '#a1a1aa',
        cursorAccent: '#09090b',
        selectionBackground: '#27272a',
        black: '#18181b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#22d3ee',
        white: '#f4f4f5',
        brightBlack: '#71717a',
        brightRed: '#fca5a5',
        brightGreen: '#86efac',
        brightYellow: '#fde047',
        brightBlue: '#93c5fd',
        brightMagenta: '#d8b4fe',
        brightCyan: '#67e8f9',
        brightWhite: '#ffffff'
    }
};

export const TerminalComponent = ({ socket }: { socket: Socket }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!terminalRef.current || !socket) {
            return;
        }

        let term: Terminal;
        let fitAddon: FitAddon;

        // Initialize terminal only on client side
        if (typeof window !== 'undefined') {
            fitAddon = new FitAddon();
            term = new Terminal(MODERN_TERMINAL_OPTIONS);

            const terminalHandler = ({ data }: { data: ArrayBuffer | string }) => {
                if (data && term) {
                    const stringData = ab2str(data);
                    console.log('Terminal data:', stringData);
                    term.write(stringData);
                }
            };

            socket.emit("requestTerminal");
            socket.on("terminal", terminalHandler);

            term.loadAddon(fitAddon);
            term.open(terminalRef.current);
            
            // Small delay to ensure proper rendering
            setTimeout(() => {
                fitAddon.fit();
            }, 50);

            term.onData((data: string) => {
                socket.emit('terminalData', { data });
            });

            socket.emit('terminalData', { data: '\n' });

            // Handle window resize
            const handleResize = () => {
                if (fitAddon) {
                    setTimeout(() => {
                        fitAddon.fit();
                    }, 50);
                }
            };

            window.addEventListener('resize', handleResize);

            return () => {
                socket.off("terminal", terminalHandler);
                window.removeEventListener('resize', handleResize);
                if (term) {
                    term.dispose();
                }
            };
        }
    }, [socket]);

    return (
        <div 
            ref={containerRef}
            className="relative w-full max-w-4xl mx-auto"
            style={{ minHeight: '500px' }}
        >
            {/* Terminal Header */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-t-xl px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-zinc-400 text-sm font-medium">Terminal</div>
                </div>
                <div className="flex items-center space-x-2 text-zinc-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                    </svg>
                </div>
            </div>
            
            {/* Terminal Body */}
            <div className="bg-zinc-950 border-l border-r border-b border-zinc-800 rounded-b-xl overflow-hidden">
                <div className="p-4">
                    <div
                        ref={terminalRef}
                        className="min-h-[400px] w-full"
                        style={{ 
                            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", Monaco, Consolas, monospace',
                            fontSize: '14px',
                            lineHeight: '1.4'
                        }}
                    />
                </div>
            </div>
            
            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
        </div>
    );
};