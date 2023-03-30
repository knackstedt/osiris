import { Server, Socket } from "socket.io";
import os from "os";
import si from 'systeminformation';



export class MetricSocketService {
    constructor(server) {

        const io = new Server(server, {
            path: "/ws/metrics.io"
        });

        let interval;

        // "connection" event happens when any client connects to this io instance.
        io.on("connection", socket => {


            // Create a new pty service when client connects.
            console.log("socket has been bound")
            interval = setInterval(async() => {

                // Send dynamic data
                const data = await si.getDynamicData();
                socket.emit("metrics", data);
            }, 10000);

            // Send initial data
            si.getStaticData().then(data => socket.emit("static", data));
            si.getDynamicData().then(data => socket.emit("metrics", data));

            socket.on("disconnect", () => {
                clearInterval(interval);
            });
        });
    }
}
