import { Server, Socket } from "socket.io";

import os from "os";

// Delay time in ms for new metrics to be emitted
const refreshInterval = 1000;

export class MetricSocketServer {
    constructor(server, path) {
        if (!server) {
            throw new Error("Server not found...");
        }

        // const io = new socketIO.Server(server);
        const io = new Server(server, {
            path,
            cors: {
                origin: "https://localhost:3000"
            }
        });

        io.on("connection", socket => {
            console.log("Metric Socket connection established.", socket.id);

            const i = setInterval(() => {
                const data = {
                    totalMemory: os.totalmem(),
                    usedMemory: (os.totalmem() - os.freemem()) / 1024 / 1024,
                    uptime: os.uptime()
                }

                socket.emit("output", data);
            }, refreshInterval);


            socket.on("disconnect", () => clearInterval(i));
        });
    }
}
