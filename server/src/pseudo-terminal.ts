import { IPty, spawn } from 'node-pty';
import os from 'os';

const SHELL = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

type Session = {
  terminal: IPty;
  replId: string;
};

export class TerminalManager {
  private sessions: Record<string, Session> = {};

  createPty(id: string, replId: string, onData: (data: string) => void): IPty {
    const term = spawn(SHELL, [], {
      name: 'xterm-color',
      cols: 80,
      rows: 24,
      cwd: '/workspace',
      env: process.env,
    });

    this.sessions[id] = { terminal: term, replId };

    term.onData(onData);

    term.onExit(() => {
      delete this.sessions[id];
    });

    return term;
  }

  write(id: string, data: string) {
    this.sessions[id]?.terminal.write(data);
  }

  kill(id: string) {
    this.sessions[id]?.terminal.kill();
    delete this.sessions[id];
  }
}
