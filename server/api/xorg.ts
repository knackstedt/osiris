import * as express from "express";
import { route, getFilesInFolder } from '../util';
import * as pty from "node-pty";

const router = express.Router();

const spawnedProcesses = [];

/**
 * Start an xorg session with the specified application
 * This endpoint serves to initialize the application in
 * xorg to open a websocket connection that we can proxy.
 */
router.use('/start', route(async (req, res, next) => {
    const { program, cwd } = req.body;

    // (await API.x11Manager.getActiveDisplay()),

    spawnedProcesses.push({


        // xpra start --bind-tcp=0.0.0.0:3200 --start=gedit --no-daemon --html=on
        proc: pty.spawn("xpra", [
            "--start=" + program,
            "--no-daemon",
            "--sharing=yes",
            "--html=off",
            "--mdns=no",
            "--start-via-proxy=no",
            "--start-new-commands=no",
            "--open-files=no",
            "--open-url=no",
            "--webcam=no",
            "--dpi=144",
            "--headerbar=yes|no|force" // may be useful
            // "--attach=no",
            // "--uid=1000", // user id
            // "--gid=1000", // group id
        ], {
            cwd: cwd || process.env['HOME'],
            env: process.env
        })
    });
}));

/**
 * Return the list of installed applications on the system.
 */
router.get('/', route(async (req, res, next) => {

    const sysApps = (await getFilesInFolder(`/usr/share/applications`, false))
        .files.filter(f => f.ext == "desktop").map(f => f.name);
    const userApps = (await getFilesInFolder(`~/.local/share/applications`, false))
        .files.filter(f => f.ext == "desktop").map(f => f.name);

    res.send({
        system: sysApps,
        user: userApps
    });
}));


export const XOrgApi = router;