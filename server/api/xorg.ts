import * as express from "express";
import { route, getFilesInFolder } from '../util';
import * as pty from "node-pty";
import { promises } from "dns";
import { readFile, ensureFile } from 'fs-extra';

const router = express.Router();

const spawnedProcesses = [];

// /**
//  * Start an xorg session with the specified application
//  * This endpoint serves to initialize the application in
//  * xorg to open a websocket connection that we can proxy.
//  */
// router.use('/start', route(async (req, res, next) => {
//     const { program, cwd } = req.body;

//     // (await API.x11Manager.getActiveDisplay()),

//     spawnedProcesses.push({
//         // xpra start --bind-tcp=0.0.0.0:3200 --start=gedit --no-daemon --html=on
//         proc: pty.spawn("xpra", [
//             "--start=" + program,
//             "--no-daemon",
//             "--sharing=yes",
//             "--html=off",
//             "--mdns=no",
//             "--start-via-proxy=no",
//             "--start-new-commands=no",
//             "--open-files=no",
//             "--open-url=no",
//             "--webcam=no",
//             "--dpi=144",
//             "--headerbar=yes|no|force" // may be useful
//             // "--attach=no",
//             // "--uid=1000", // user id
//             // "--gid=1000", // group id
//         ], {
//             cwd: cwd || process.env['HOME'],
//             env: process.env
//         })
//     });
// }));

router.get('/icon/:source/:slug', route(async (req, res, next) => {
    const { source, slug } = req.params;
    if (!source || !slug) return next(400);

    const dir = pathMap.find(p => p.source == source)?.path;

    if (!dir || !ensureFile(dir + slug)) return next(400);

    const lines = await readFile(dir + slug, 'utf-8')
    const desktopFile = parseDesktopFile(lines);



    // res.send({
    //     system: sysApps,
    //     user: userApps
    // });
}));

const pathMap = [
    { source: "user", path: "/home/knackstedt/.local/share/applications" },
    { source: "system", path: "/usr/share/applications" },
    // { source: "user", path: "/usr/share/applications" },
]

const parseDesktopFile = (text: string): {
    /**
     * e.g. Play;Pause;Stop;StopAfterCurrent;Previous;Next;
     */
    actions?: string,
    categories?: string,
    comment?: string,
    exec?: string,
    encoding?: string,
    icon?: string,
    name?: string,
    genericName?: string,
    keywords?: string,
    terminal?: "true" | "false",
    tryExec?: string,
    type?: "Application",
    mimeType?: string,
    noDisplay?: "true" | "false",
    notShowIn?: string,
    startupNotify?: "true" | "false",
    startupWMClass?: string,
    version?: string

    [key: string]: string
} => {
    return text
        .split(/[\r\n]/)
        .filter(line => !line.startsWith('['))
        .map(line => {
            const obj = {};
            const parts = line.split('=');

            const key = parts[0].slice(0, 1).toLowerCase() + parts[0].slice(1);
            obj[key] = parts[1];
            return obj;
        })
        .reduce((a, b) => ({ ...a, ...b }), {}) as any
}

const loadDesktopFiles = async (path, source) => {
    const { files } = await getFilesInFolder(path, false);

    const desktopFiles = files.filter(f => f.ext == "desktop");

    const desktopFileContents = await Promise.all(desktopFiles.map(f =>
        readFile(f.path + f.name, "utf-8")
            .then(lines => ({name: f.name, lines}))
    ));

    return desktopFileContents.map(({ lines, name }) => {

        const out = parseDesktopFile(lines);

        out['slug'] = name;
        out['source'] = source;
        return out;
    });
}

/**
 * Return the list of installed applications on the system.
 */
router.get('/', route(async (req, res, next) => {
    const out = await Promise.all(pathMap.map(pair => loadDesktopFiles(pair.path, pair.source)));

    res.send(out.flat());
}));

// TODO: Get all flatpaks?
// Get all APT installation
// ~/.local/share/flatpak/app/org.gimp.GIMP/current/active/metadata
// The current configuration sucks ass.
// inventory_2

export const XOrgApi = router;
