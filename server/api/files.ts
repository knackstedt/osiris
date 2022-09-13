import * as express from "express";
import { environment } from "../environment";
import { route, getFilesInFolder } from '../util';
import fs from 'fs';
import { readFile, stat, access } from "fs-extra";
import { isText, isBinary, getEncoding } from 'istextorbinary';
import { getHeapStatistics } from "v8";

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
router.use('/save', route(async (req, res, next) => {
    // TODO: save file
    const { path } = req.body;

    res.setHeader("content-type", "some/type");
    fs.createReadStream(path).pipe(res);

    res.send("null");
}));

router.use('/', route(async (req, res, next) => {
    const { path, showHidden } = req.body;

    // If the file doesn't exist
    let hasAccess = await access(path, fs.constants.F_OK | fs.constants.W_OK | fs.constants.R_OK)
        .then(r => true)
        .catch(e => {
            res.send(e);
        })
    
    if (!hasAccess) return;

    let stats = await stat(path);

    if (stats.isDirectory()) {
        let {dirs, files} = await getFilesInFolder(path);
    
        if (!showHidden) {
            dirs = dirs.filter(d => !d.startsWith('.'));
            files = files.filter(f => !f.startsWith('.'));
        }
    
        res.send({dirs, files});
        return;
    }
    else if (stats.isFile()) {
        if (isText(path)) {
            let data = await readFile(path, { encoding: "utf-8" });

            res.send({
                meta: stats,
                content: data
            })
        }
        else if (stats.size < 2 * 1024 * 1024) {
            let buf = await readFile(path);
            if (isText(null, buf)) {
                res.send({
                    meta: stats,
                    content: buf.toString()
                });
            }
            else {
                res.send({
                    meta: stats
                });
            }
        }
        else {
            res.send({
                meta: stats
            });
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