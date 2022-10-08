import * as express from "express";
import { route, getFilesInFolder } from '../util';
import fs from 'fs-extra';
import { readFile, stat, access } from "fs-extra";
import os from 'os';
import * as pty from "node-pty";

const router = express.Router();

const platform = os.platform();

const procs = [];

router.use('/', route(async (req, res, next) => {

    const { command, script, start } = req.body;
    let process = procs.find(p => p.f == 1);

    if (process) {
        process.kill();
        procs.push(null);

        return res.send({ stopped: true });
    }

    // if (!start) 
    //     return res.send({ stopped: false });

    if (command) {
        procs.push(
            // pty.spawn(command, [], {
            //     name: "xterm-color",
            //     cwd: process.env['HOME'], // Which path should terminal start
            //     env: process.env // Pass environment variables
            // })
            cp.spawn(command, args || [], {
                cwd,
                env,
                stdio: "pipe",
            })
        );
        res.send("running");
        return;
    }

    if (!script) {
        return;
    }

    // write script to temp file
    const tmpFile = os.tmpdir() + "/" + Math.random().toString(36).substr(2);
    await fs.writeFile(tmpFile, script);
    if (platform == "win32") {
        procs.push(
            cp.spawn("cmd.exe", ["/c", tmpFile], {
                cwd,
                env,
            })
        );
        res.send("running");
    }
    else if (platform == "darwin" || platform == "linux") {
        procs.push(
            cp.spawn("sh", [tmpFile], {
                cwd,
                env,
            })
        );
        res.send("running");
    }

}));

/**
 * Export a number of API routes that are needed for the main portal UI.
 */
export const FilesystemApi = router;