import * as express from "express";
import { route, getFilesInFolder } from '../util';
import { readFile, stat, access } from "fs-extra";
import { isText } from 'istextorbinary';
import mime from "mime-types";
import AdmZip from "adm-zip";
import fs from "fs-extra";
import crypto from 'crypto';
import { secureWipe } from '../api/files/util';


process.on('uncaughtException', function (exception) {
    console.log(exception); // to see your exception details in the console
    // if you are on production, maybe you can send the exception details to your
    // email as well ?
});

const router = express.Router();

router.use('/download', route(async (req, res, next) => {
    const { dir, file } = req.query as any;
    if (!dir || !file) return next(400);

    try {
        let stats = await stat(dir + file);

        if (req.headers.range) {
            const range = req.headers.range;
            const CHUNK_SIZE = 10 ** 6; // 1MB
            const start = Number(range.replace(/\D/g, ""));
            const end = Math.min(start + CHUNK_SIZE, stats.size - 1);
            const contentLength = end - start + 1;

            res.writeHead(206, {
                "content-range": `bytes ${start}-${end}/${stats.size}`,
                "accept-ranges": "bytes",
                "content-length": contentLength
            });

            const videoStream = fs.createReadStream(dir + file, { start, end });
            videoStream.pipe(res);
        }
        else { // No range was specified so we just stream the response.
            const stream = fs.createReadStream(dir + file);
            stream.on('error', err => next(err));
            res.setHeader("content-length", stats.size);

            stream.pipe(res);
        }
    }
    catch (ex) {
        next(ex);
    }
}));

/**
 * Read files
 */
router.post('/file', route(async (req, res, next) => {
    // TODO: save file
    const { files } = req.body;
    const { only } = req.query;

    if (!files || !Array.isArray(files)) return next(400);

    Promise.all(files.map(file => new Promise(async (resolve, reject) => {

        const ct = mime.lookup(file) || "application/octet-stream";

        res.setHeader("content-type", ct);
        let stats = await stat(file);

        if (isText(file)) {

            resolve({
                name: file,
                meta: stats,
                type: "text",
                content: only != "stat" && await readFile(file, { encoding: "utf-8" })
            })
        }
        else if (stats.size < 2 * 1024 * 1024) {
            let buf = await readFile(file);
            if (isText(null, buf)) {
                resolve({
                    name: file,
                    meta: stats,
                    type: "text",
                    content: only != "stat" && buf.toString()
                });
            }
            else {
                resolve({
                    name: file,
                    meta: stats,
                    type: "binary"
                });
            }
        }
        else {
            resolve({
                name: file,
                meta: stats,
                type: "binary"
            });
        }
    })))
    .then(result => res.send(result))
    .catch(err => next(err));
}));

/**
 * Delete a file (unlink)
 */
router.post('/delete', route(async (req, res, next) => {
    // TODO: save file
    const { files } = req.body;
    const wipe = !!req.query['wipe'];

    if (!files || !Array.isArray(files)) return next(400);

    Promise.all(files.map(file => wipe ? secureWipe(file) : fs.unlink(file)))
        .then(result => res.send(result))
        .catch(err => next(err));
}));

/**
 * Calculate a specified checksum via a read stream.
 */
router.use('/checksum/:type', route(async (req, res, next) => {
    const checksum = req.params['type']?.toLowerCase();

    if (!["md5", "sha1", "sha256", "sha512"].includes(checksum)) return next(400);

    // TODO: secure this properly.
    const stream = await fs.createReadStream(req.body.path);

    const hash = crypto.createHash(checksum);

    stream.pipe(hash);


    stream.on("close", () => {
        const sum = hash.digest("hex");

        res.send({
            sum,
            length: stream.bytesRead
        });
    })

    stream.on('error', (error) => {
        next(error);
    });
}));

// TODO: support reading subfolders!
const readZip = (absPath: string, subpath = '') => {
    absPath = absPath.replace(/\/{2,}/g, '/'); // collapse extra slashes
    subpath = subpath.replace(/\/{2,}/g, '/');
    const zip = new AdmZip(absPath);
    const zipEntries = zip.getEntries();

    const zipName = absPath.split('/').pop().replace(/\.zip$/, '');

    const out = {
        dirs: [],
        files: []
    };

    const localPath = zipName + '/' + subpath;
    const subpathMatcher = new RegExp('[' + subpath.split('').join('][') + ']\/?');

    function filterLocalPath(entry: AdmZip.IZipEntry) {
        // Omit anything that's in a different directory altogether
        if (!entry.entryName.startsWith(subpath)) return false;

        // Skip if the entry is the item selected from the subpath
        if (entry.entryName.replace(subpath, '').length <= 1) return false;

        // Check if the entry is the root file
        // if (entry.isDirectory && entry.entryName != (localPath + '/')) return false;

        // Check if the file is nested deeper than we're looking
        const local = entry.entryName.replace(subpathMatcher, '');
        if (!local || local.split('/').filter(e => e).length > 1) return false;

        return true
    }

    zipEntries
        .filter(e => e.isDirectory)
        .filter(e => filterLocalPath(e))
        .forEach(e => {
            let path = absPath + "#/" + e.entryName.split('/').slice(0, -2).join('/') + '/';
            path = path.replace(/\/{2,}/g, '/');

            out.dirs.push({
                path: path,
                name: e.entryName.split('/').slice(-2, -1)[0],
                kind: "directory",
                comment: e.comment,
                entry: e.entryName
            })
        });

    zipEntries
        .filter(e => !e.isDirectory)
        .filter(e => filterLocalPath(e))
        .forEach(e => {
            let path = absPath + "#/" + e.entryName.split('/').slice(0, -1).join('/');
            path = path.replace(/\/{2,}/g, '/');

            out.files.push({
                kind: "file",
                path: path,
                name: e.name,
                ext: e.name.split('.').pop(),
                stats: {
                    size: e.header.size,
                    compressedSize: e.header.compressedSize,
                    mtimeMs: e.header.time.getTime(),
                    atimeMs: e.header.time.getTime(),
                    ctimeMs: e.header.time.getTime()
                }
            });
        });

    return out;
};

router.use('/', route(async (req, res, next) => {
    let { path, showHidden } = req.body;

    // A path that filters the contents returned for an archive
    let archiveSubpath: string;

    // TODO: make this work better
    if (path.includes(".zip#/")) {
        let [outerpath, innerpath] = path.split("#/");
        path = outerpath;
        archiveSubpath = innerpath;
    }

    if (!path) return next(400);

    // If the file doesn't exist
    let hasAccess = await access(path, fs.constants.F_OK | fs.constants.W_OK | fs.constants.R_OK)
        .then(r => true)
        .catch(e => {
            next(e);
        })

    if (!hasAccess) return;

    let stats = await stat(path);

    if (stats.isDirectory()) {
        let {dirs, files} = await getFilesInFolder(path, showHidden, 1);

        res.send({dirs, files});
        return;
    }
    else if (stats.isFile()) {
        const ext = (path.split('.').pop());
        if (ext == "zip") {
            res.send(readZip(path, archiveSubpath));
        }
        else {
            next({
                status: 400,
                message: `Unsupported file type [${ext}]`,
            })
        }
    }
    else {
        const type = stats.isBlockDevice() && "block device" ||
            stats.isCharacterDevice() && "character device" ||
            stats.isFIFO() && "pipe/fifo" ||
            stats.isSocket() && "socket" ||
            stats.isSymbolicLink() && "symlink" ||
            "unknown";
        next({
            status: 400,
            message: `Unsupported file type [${type}]`,
        })
    }
}));

/**
 * Export a number of API routes that are needed for the main portal UI.
 */
export const FilesystemApi = router;
