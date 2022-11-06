import { Server, Socket } from "socket.io";

import os from "os";
import * as pty from "node-pty";

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

class PTY {
    ptyProcess: pty.IPty = null;

    constructor(private socket: Socket) {
        // Spawn a TTY
        this.ptyProcess = pty.spawn(shell, [], {
            name: "xterm-color",
            cwd: process.env['HOME'], // Which path should terminal start
            env: process.env // Pass environment variables
        });

        // Pipe response data
        this.ptyProcess.onData(data => this.socket.emit("output", data));
    }

    write = this.ptyProcess.write;

    dispose() {
        this.ptyProcess.kill();
    }
}


export class TTYSocketServer {
    constructor(server, path) {
        if (!server) {
            throw new Error("Server not found...");
        }

        const io = new Server(server, {
            path,
            cors: {
                origin: "https://localhost:3000"
            }
        });

        io.on("connection", socket => {
            console.log("TTY Socket connection established.", socket.id);

            // Create a new pty service when client connects.
            const pty = new PTY(socket);

            socket.on("disconnect", () => pty.dispose());
            socket.on("input", input => pty.write(input));
        });
    }
}
