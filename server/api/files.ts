import * as express from "express";
import { route, getFilesInFolder } from '../util';
import { readFile, stat, access } from "fs-extra";
import { isText } from 'istextorbinary';
import mime from "mime-types";
import AdmZip from "adm-zip";
import fs from "fs-extra";
import crypto from 'crypto';


process.on('uncaughtException', function (exception) {
    console.log(exception); // to see your exception details in the console
    // if you are on production, maybe you can send the exception details to your
    // email as well ?
});

const router = express.Router();

const generateThumbnail = (path: string) => {
    // return sharp('input.jpg')
    //     .rotate()
    //     .resize(200)
    //     .jpeg({ mozjpeg: true })
    //     .toBuffer()
}

// router.use('/dir', route(async (req, res, next) => {
//     res.send(pages);
// }));
// router.use('/file', route(async (req, res, next) => {

//     res.send(pages);
// }));

// https://www.npmjs.com/package/adm-zip
router.use('/zip', route(async (req, res, next) => {
    const { dir, file } = req.body;

    let zip = new AdmZip(dir + file);
    let zipEntries = zip.getEntries();

    // zipEntries.forEach(function (zipEntry) {
    //     console.log(zipEntry.toString());
    //     if (zipEntry.entryName == "my_file.txt") {
    //         console.log(zipEntry.getData().toString("utf8"));
    //     }
    // });
    res.send(zipEntries);
}));

router.use('/rar', route(async (req, res, next) => {
    const { dir, file } = req.body;

    let zip = new AdmZip(dir + file);
    let zipEntries = zip.getEntries();

    // zipEntries.forEach(function (zipEntry) {
    //     console.log(zipEntry.toString());
    //     if (zipEntry.entryName == "my_file.txt") {
    //         console.log(zipEntry.getData().toString("utf8"));
    //     }
    // });
    res.send(zipEntries);
}));

router.use('/7z', route(async (req, res, next) => {
    const { dir, file } = req.body;

    let zip = new AdmZip(dir + file);
    let zipEntries = zip.getEntries();

    // zipEntries.forEach(function (zipEntry) {
    //     console.log(zipEntry.toString());
    //     if (zipEntry.entryName == "my_file.txt") {
    //         console.log(zipEntry.getData().toString("utf8"));
    //     }
    // });
    res.send(zipEntries);
}));

router.use('/tar', route(async (req, res, next) => {
    const { dir, file,  } = req.body;

    // let entries = [];
    // tar.t({
    //     file: dir + file
    // })
    // .on("onentry", (entry) => {
    //     entries.push(entry);
    // })
    // .on("finish", () => {
    //     res.send(entries);
    // })
    // .on("error", next);

}));

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

router.use('/file', route(async (req, res, next) => {
    // TODO: save file
    const file = req.body;
    const { only } = req.query;

    if (!file) return next(400);

    const files = Array.isArray(file) ? file : [file];

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

router.use('/', route(async (req, res, next) => {
    const { path, showHidden } = req.body;

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
