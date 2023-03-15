import { Server, Socket } from "socket.io";

import os from "os";
import * as pty from "node-pty";

type ptyOpts = {
    shell: string,
    cwd: string
}

class PTY {
    shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    ptyProcess: pty.IPty = null;

    constructor(private socket: Socket, private options: ptyOpts) {

        try {
            const shell = options.shell || this.shell;
            const cwd = options.cwd;
            console.log(shell, cwd)
            this.ptyProcess = pty.spawn(shell, [], {
                name: "xterm-color",
                cwd: options.cwd,
                env: process.env
            });
        }
        catch (ex) {
            socket.emit("init-error", ex);
        }
        // Add a "data" event listener.
        this.ptyProcess.onData(data => {
            this.socket.emit("output", data);
        });
    }

    write(data) {
        this.ptyProcess.write(data);
    }

    dispose() {
        this.socket.disconnect();
        this.socket._cleanup();
        this.ptyProcess.kill();
    }
}

export class TerminalSocketService {
    constructor(server) {
        if (!server) {
            throw new Error("Server not found");
        }

        // const io = new socketIO.Server(server);
        const io = new Server(server, {
            path: "/ws/terminal.io"
        });

        // console.log("Created socket server. Waiting for client connection.");

        // "connection" event happens when any client connects to this io instance.
        io.on("connection", socket => {
            let pty: PTY;

            // Create a new pty service when client connects.
            socket.on("start", ({shell, cwd}) => {
                pty = new PTY(socket, {shell, cwd});
            });

            socket.on("disconnect", () => {
                pty.dispose();
            });

            socket.on("input", input => {
                pty.write(input);
            });
        });
    }
}
