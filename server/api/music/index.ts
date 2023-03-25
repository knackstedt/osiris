import * as express from "express";
import { route, getFilesInFolder, getFilesInFolderFlat } from '../../util';
import { readFile, stat, access } from "fs-extra";
import { isText } from 'istextorbinary';
import mime from "mime-types";
import fs from "fs-extra";
import { parseFile } from 'music-metadata';
import { Server, Socket } from "socket.io";
import { Level } from 'level';

const router = express.Router();

/**
 * Scan the library and build the metadata database.
 */
router.use('/scan', route(async (req, res, next) => {

    const files = await getFilesInFolderFlat(`/home/knackstedt/Music`);

    let count = 0;
    await Promise.all(files.map(async f => {
        const file = f.path + f.name;
        const meta = await parseFile(file).catch(e => (null));
        if (!meta) return;

        await fs.writeFile(file + '_meta.json', JSON.stringify(meta));
        count++;
    }));

    res.send(count);
}));

/**
 * Load the whole music library... (/home/user/Music)
 */
router.use('/library', route(async (req, res, next) => {
    if (!fs.access(`/home/knackstedt/Music/.osiris-stat`)) {
        // trigger scan
    }

    const files = await getFilesInFolderFlat(`/home/knackstedt/Music`);

    await Promise.all(files.map(async f => {
        const meta = await parseFile(f.path + f.name).catch(e => (null));
        if (!meta) return;
        f['meta'] = {
            native: meta.native
        };
    }));

    res.send(files);
}));


export const MusicApi = router;


class MusicLibrary {
    private db: Level;

    constructor(private socket: Socket, opts) {

        this.db = new Level(opts.path + ".db", {valueEncoding: 'json'});
    }

    scanNum = 0;
    isScanning = false;
    async scan(folder: string) {
        if (this.isScanning) {
            this.socket.emit("scanstart-err", new Error("Scan is already running"));
            return;
        }


        this.socket.emit("scanstart");
        let files = await getFilesInFolderFlat(folder);

        let start = Date.now()
        this.socket.emit("scan", this.scanNum = 0);


        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const meta = await parseFile(f.path + f.name).catch(e => (null));

            this.db.put(`meta-${f.path+f.name}`, meta);

            this.socket.emit("scan", this.scanNum+=1);
        }

        this.isScanning = false;
        let duration = Date.now() - start;
        this.socket.emit("scanend", {duration, count: this.scanNum});
    }

    dispose() {
        this.socket.disconnect();
        this.socket._cleanup();
    }
}

export class MusicSocketService {
    constructor(server) {
        const io = new Server(server, { path: "/ws/music.io" });

        // "connection" event happens when any client connects to this io instance.
        io.on("connection", socket => {
            let mlib;
            // Create a new pty service when client connects.
            socket.on("start", (data) => {
                mlib = new MusicLibrary(socket, data);
            });

            socket.on("disconnect", () => {
                mlib.dispose();
            });

            socket.on("scan", input => {
                mlib.scan(input);
            });

            socket.on("resize", data => {
                mlib.resize(data);
            });
        });
    }
}
