import * as express from "express";
import { environment } from "../environment";
import { route, getFilesInFolder } from '../util';
import {  } from "fs-extra";
import { fstat } from "fs";
import { catchError } from 'rxjs/operators';

const router = express.Router();

const generateThumbnail = (path: string) => {
    // return sharp('input.jpg')
    //     .rotate()
    //     .resize(200)
    //     .jpeg({ mozjpeg: true })
    //     .toBuffer()
}

/**
 * Get the list of pages (menu-items) that the user has access to.
 * These are also used as a basic ACL using the user's groups for the portal reverse proxy.
 */

const shareDir = "/home/knackstedt";

// router.use('/dir', route(async (req, res, next) => {
//     res.send(pages);
// }));
// router.use('/file', route(async (req, res, next) => {

//     res.send(pages);
// }));
router.use('/', route(async (req, res, next) => {
    const { path, showHidden } = req.body;
    let {dirs, files} = await getFilesInFolder(path);

    if (!showHidden) {
        dirs = dirs.filter(d => !d.startsWith('.'));
        files = files.filter(f => !f.startsWith('.'));
    }

    res.send({dirs, files});
    // res.send(pages);
}));

/**
 * Export a number of API routes that are needed for the main portal UI.
 */
export const FilesystemApi = router;