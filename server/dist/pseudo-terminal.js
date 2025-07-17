"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalManager = void 0;
const node_pty_1 = require("node-pty");
const os_1 = __importDefault(require("os"));
const SHELL = os_1.default.platform() === 'win32' ? 'powershell.exe' : 'bash';
class TerminalManager {
    constructor() {
        this.sessions = {};
    }
    createPty(id, replId, onData) {
        const term = (0, node_pty_1.spawn)(SHELL, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: '/workspace', // or user’s container volume
            env: process.env,
        });
        this.sessions[id] = { terminal: term, replId };
        term.onData(onData);
        term.onExit(() => {
            delete this.sessions[id];
        });
        return term;
    }
    write(id, data) {
        var _a;
        (_a = this.sessions[id]) === null || _a === void 0 ? void 0 : _a.terminal.write(data);
    }
    kill(id) {
        var _a;
        (_a = this.sessions[id]) === null || _a === void 0 ? void 0 : _a.terminal.kill();
        delete this.sessions[id];
    }
}
exports.TerminalManager = TerminalManager;
