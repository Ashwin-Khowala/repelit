// // "use client";
// // import { useEffect, useRef } from "react"
// // import { Socket } from "socket.io-client";
// // import { Terminal } from "@xterm/xterm";
// // import { FitAddon } from '@xterm/addon-fit';
// // import 'xterm/css/xterm.css'

// // // let Terminal , FitAddon ;

// // // useEffect(()=>{
// // //     const initTerminal = async () => {
// // //         const { Terminal } = await import('@xterm/xterm');
// // //         const { FitAddon } = await import('@xterm/addon-fit');
// // //         this.Terminal = Terminal ;
// // //         // Add logic with `term`
// // //     }
// // //     initTerminal()
// // // },[])



// // function ab2str(buf: ArrayBuffer): string {
// //     return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
// // }

// // const OPTIONS_TERM = {
// //     useStyle: true,
// //     screenKeys: true,
// //     cursorBlink: true,
// //     cols: 200,
// //     rows: 50,
// //     theme: {
// //         background: "black",
// //         foreground: "white",
// //         cursor: "white",
// //         selection: "rgba(255, 255, 255, 0.3)"
// //     },
// //     fontSize: 14,
// //     fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
// // };

// // export const TerminalComponent = ({ socket }: { socket: Socket }) => {
// //     const terminalRef = useRef<HTMLDivElement>(null);
// //     const termRef = useRef<Terminal | null>(null);
// //     const fitAddonRef = useRef<FitAddon | null>(null);

// //     useEffect(() => {
// //         if (!terminalRef.current || !socket) {
// //             return;
// //         }

// //         // Initialize terminal and fit addon
// //         const fitAddon = new FitAddon();
// //         fitAddonRef.current = fitAddon;
        
// //         const term = new Terminal(OPTIONS_TERM);
// //         termRef.current = term;
        
// //         term.loadAddon(fitAddon);
// //         term.open(terminalRef.current);
        
// //         // Fit terminal to container
// //         setTimeout(() => {
// //             fitAddon.fit();
// //         }, 0);

// //         // Terminal event handlers
// //         function terminalHandler({ data }: { data: any }) {
// //             if (!term) return;
            
// //             if (data instanceof ArrayBuffer) {
// //                 const text = ab2str(data);
// //                 term.write(text);
// //             } else if (typeof data === 'string') {
// //                 term.write(data);
// //             } else if (data && typeof data === 'object' && data.data) {
// //                 // Handle nested data structure
// //                 if (data.data instanceof ArrayBuffer) {
// //                     term.write(ab2str(data.data));
// //                 } else {
// //                     term.write(data.data);
// //                 }
// //             }
// //         }
        
// //         // Request terminal session
// //         socket.emit("requestTerminal");
// //         // Socket event listeners
// //         socket.on("terminal", terminalHandler);
        
// //         // Handle terminal input
// //         term.onData((data) => {
// //             socket.emit('terminalData', { data });
// //         });

// //         // Handle terminal resize
// //         term.onResize(({ cols, rows }) => {
// //             socket.emit('terminalResize', { cols, rows });
// //         });


// //         // Send initial newline
// //         setTimeout(() => {
// //             socket.emit('terminalData', { data: '\n' });
// //         }, 100);

// //         // Handle window resize
// //         const handleResize = () => {
// //             if (fitAddon && term) {
// //                 setTimeout(() => {
// //                     fitAddon.fit();
// //                 }, 0);
// //             }
// //         };

// //         window.addEventListener('resize', handleResize);

// //         // Cleanup function
// //         return () => {
// //             socket.off("terminal", terminalHandler);
// //             window.removeEventListener('resize', handleResize);
            
// //             if (term) {
// //                 term.dispose();
// //             }
            
// //             termRef.current = null;
// //             fitAddonRef.current = null;
// //         };
// //     }, [socket]);

// //     // Handle container resize
// //     useEffect(() => {
// //         const resizeObserver = new ResizeObserver(() => {
// //             if (fitAddonRef.current && termRef.current) {
// //                 setTimeout(() => {
// //                     fitAddonRef.current?.fit();
// //                 }, 0);
// //             }
// //         });

// //         if (terminalRef.current) {
// //             resizeObserver.observe(terminalRef.current);
// //         }

// //         return () => {
// //             resizeObserver.disconnect();
// //         };
// //     }, []);

// //     return (
// //         <div 
// //             style={{
// //                 width: "40vw", 
// //                 height: "400px", 
// //                 textAlign: "left",
// //                 border: "1px solid #333",
// //                 borderRadius: "4px",
// //                 overflow: "hidden"
// //             }} 
// //             ref={terminalRef}
// //         />
// //     );
// // };


// "use client";
// import { useEffect, useRef } from "react"
// import { Socket } from "socket.io-client";

// // Dynamic imports for SSR compatibility
// let Terminal: any, FitAddon: any;

// function ab2str(buf: ArrayBuffer): string {
//     return String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)));
// }

// const OPTIONS_TERM = {
//     useStyle: true,
//     screenKeys: true,
//     cursorBlink: true,
//     cols: 200,
//     rows: 50,
//     theme: {
//         background: "black",
//         foreground: "white",
//         cursor: "white",
//         selection: "rgba(255, 255, 255, 0.3)"
//     },
//     fontSize: 14,
//     fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace'
// };

// export const TerminalComponent = ({ socket }: { socket: Socket }) => {
//     const terminalRef = useRef<HTMLDivElement>(null);
//     const termRef = useRef<any>(null);
//     const fitAddonRef = useRef<any>(null);

//     useEffect(() => {
//         // Initialize xterm modules first
//         const initTerminal = async () => {
//             try {
//                 // Dynamic imports to avoid SSR issues
//                 const { Terminal: TerminalClass } = await import('@xterm/xterm');
//                 const { FitAddon: FitAddonClass } = await import('@xterm/addon-fit');
                
//                 Terminal = TerminalClass;
//                 FitAddon = FitAddonClass;

//                 if (!terminalRef.current || !socket || !Terminal || !FitAddon) {
//                     return;
//                 }

//                 // Initialize terminal and fit addon
//                 const fitAddon = new FitAddon();
//                 fitAddonRef.current = fitAddon;
                
//                 const term = new Terminal(OPTIONS_TERM);
//                 termRef.current = term;
                
//                 term.loadAddon(fitAddon);
//                 term.open(terminalRef.current);
                
//                 // Fit terminal to container
//                 setTimeout(() => {
//                     fitAddon.fit();
//                 }, 0);

//                 // Terminal event handlers
//                 function terminalHandler({ data }: { data: any }) {
//                     if (!term) return;
                    
//                     if (data instanceof ArrayBuffer) {
//                         const text = ab2str(data);
//                         term.write(text);
//                     } else if (typeof data === 'string') {
//                         term.write(data);
//                     } else if (data && typeof data === 'object' && data.data) {
//                         // Handle nested data structure
//                         if (data.data instanceof ArrayBuffer) {
//                             term.write(ab2str(data.data));
//                         } else {
//                             term.write(data.data);
//                         }
//                     }
//                 }
                
//                 // Request terminal session
//                 socket.emit("requestTerminal");
//                 // Socket event listeners
//                 socket.on("terminal", terminalHandler);
                
//                 // Handle terminal input
//                 term.onData((data: string) => {
//                     socket.emit('terminalData', { data });
//                 });

//                 // Handle terminal resize
//                 term.onResize(({ cols, rows }: { cols: number; rows: number }) => {
//                     socket.emit('terminalResize', { cols, rows });
//                 });

//                 // Send initial newline
//                 setTimeout(() => {
//                     socket.emit('terminalData', { data: '\n' });
//                 }, 100);

//                 // Handle window resize
//                 const handleResize = () => {
//                     if (fitAddon && term) {
//                         setTimeout(() => {
//                             fitAddon.fit();
//                         }, 0);
//                     }
//                 };

//                 window.addEventListener('resize', handleResize);

//                 // Store cleanup function
//                 return () => {
//                     socket.off("terminal", terminalHandler);
//                     window.removeEventListener('resize', handleResize);
                    
//                     if (term) {
//                         term.dispose();
//                     }
                    
//                     termRef.current = null;
//                     fitAddonRef.current = null;
//                 };
//             } catch (error) {
//                 console.error('Failed to initialize terminal:', error);
//             }
//         };

//         const cleanup = initTerminal();
        
//         // Return cleanup function
//         return () => {
//             cleanup?.then(cleanupFn => cleanupFn?.());
//         };
//     }, [socket]);

//     // Handle container resize
//     useEffect(() => {
//         const resizeObserver = new ResizeObserver(() => {
//             if (fitAddonRef.current && termRef.current) {
//                 setTimeout(() => {
//                     fitAddonRef.current?.fit();
//                 }, 0);
//             }
//         });

//         if (terminalRef.current) {
//             resizeObserver.observe(terminalRef.current);
//         }

//         return () => {
//             resizeObserver.disconnect();
//         };
//     }, []);

//     return (
//         <div 
//             style={{
//                 width: "40vw", 
//                 height: "400px", 
//                 textAlign: "left",
//                 border: "1px solid #333",
//                 borderRadius: "4px",
//                 overflow: "hidden"
//             }} 
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

const OPTIONS_TERM = {
    useStyle: true,
    screenKeys: true,
    cursorBlink: true,
    cols: 200,
    theme: {
        background: "black"
    }
};

export const TerminalComponent = ({ socket }: { socket: Socket }) => {
    const terminalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!terminalRef.current || !socket) {
            return;
        }

        let term: Terminal;
        let fitAddon: FitAddon;

        // Initialize terminal only on client side
        if (typeof window !== 'undefined') {
            fitAddon = new FitAddon();
            term = new Terminal(OPTIONS_TERM);
            
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
            fitAddon.fit();

            term.onData((data: string) => {
                socket.emit('terminalData', { data });
            });

            socket.emit('terminalData', { data: '\n' });

            // Handle window resize
            const handleResize = () => {
                if (fitAddon) {
                    fitAddon.fit();
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
            style={{ width: "40vw", height: "400px", textAlign: "left" }} 
            ref={terminalRef}
        />
    );
};