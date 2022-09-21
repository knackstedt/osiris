// Important
// Express does not handle failed async route handlers by default.

import { RequestHandler } from "express";
import * as fs from "fs-extra";
import { catchError } from 'rxjs/operators';

// We use this route to 'throw' an error when an async route has an unhandled exception.
export const route = (fn: RequestHandler) => (req, res, next) => {
    try {
        // @ts-ignore
        fn(req, res, next).catch(ex => next(ex));
    }
    catch(ex) {
        next(ex);
    }
    return null;
    // return Promise
        // .resolve(fn(req, res, next))
        // .catch(next);
    return new Promise((resolve, reject) => {
        try {
            resolve(fn(req, res, next));
        }
        catch(ex) {
            console.error("Mother")
            next(ex);
        }
    }).catch(err => next(err));
}


export const getFilesInFolder = async (folder: string, showHidden, recurse = 2) => {
    if (!folder.endsWith('/')) folder += '/';

    const contents = await fs.readdir(folder, { withFileTypes: true });

    const dirs = await Promise.all(
        contents.filter(f => f.isDirectory())
            .filter(f => !f.name.startsWith('.'))
            .map(async p => ({ 
                contents: recurse -1 > 0 ? await getFilesInFolder( folder + p.name + '/', showHidden) : [], 
                path: folder, 
                name: p.name,
                kind: "directory"
            }))
    );

    const files = await Promise.all(
        contents.filter(f => f.isFile())
            .filter(f => !f.name.startsWith('.'))
            .map(async p => ({ 
                stats: await fs.stat(folder + p.name), 
                path: folder,
                name: p.name,
                ext: p.name.split('.').pop(),
                kind: "file" 
            }))
    );

    return {dirs, files};
}


// getFilesInFolder("./", 1)
//     .then(res => console.log("files in folders", res))
//     .catch(err => console.error(err))

