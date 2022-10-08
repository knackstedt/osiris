import { Server, Socket } from "socket.io";

import os from "os";
import * as pty from "node-pty";

class PTY {
    shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    ptyProcess: pty.IPty = null;

    constructor(private socket: Socket) {
        // Setting default terminals based on user os

        // Initialize PTY process.
        this.startPtyProcess();
    }

    /**
     * Spawn an instance of pty with a selected shell.
     */
    startPtyProcess() {
        console.log("Starting PTY");

        this.ptyProcess = pty.spawn(this.shell, [], {
            name: "xterm-color",
            cwd: process.env['HOME'], // Which path should terminal start
            env: process.env // Pass environment variables
        });

        // Add a "data" event listener.
        this.ptyProcess.onData(data => {
            // Whenever terminal generates any data, send that output to socket.io client
            this.socket.emit("output", data);

        });
    }

    /**
     * Use this function to send in the input to Pseudo Terminal process.
     * @param {*} data Input from user like a command sent from terminal UI
     */
    write(data) {
        this.ptyProcess.write(data);
    }

    dispose() {
        this.socket.disconnect();
        this.socket._cleanup();
        this.ptyProcess.kill();
    }
}

export class SocketService {
    socket: Socket;
    pty: PTY;

    constructor() {
    }

    attachServer(server) {
        if (!server) {
            throw new Error("Server not found...");
        }

        // const io = new socketIO.Server(server);
        const io = new Server(server, {
            cors: {
                origin: "https://localhost:3000"
            }
        });

        console.log("Created socket server. Waiting for client connection.");

        // "connection" event happens when any client connects to this io instance.
        io.on("connection", socket => {
            console.log("Client connect to socket.", socket.id);

            this.socket = socket;

            // Create a new pty service when client connects.
            const pty = new PTY(this.socket);

            this.socket.on("disconnect", () => {
                console.log("Disconnected Socket: ", socket.id);
                pty.dispose();
            });


            // Attach event listener for socket.io
            this.socket.on("input", input => {
                // Runs this listener when socket receives "input" events from socket.io client.
                // input event is emitted on client side when user types in terminal UI
                pty.write(input);
            });
        });
    }
}
