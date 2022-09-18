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


export const getFilesInFolder = async (folder: string, recursive = false) => {
    if (!folder.endsWith('/')) folder += '/';

    const contents = await fs.readdir(folder, { withFileTypes: true });

    const dirs = contents.filter(f => f.isDirectory()).map(f => (recursive && folder || "") + f.name + '/');
    const files = contents.filter(f => !f.isDirectory()).map(f => (recursive && folder || "") + f.name);

    if (recursive) {
        let rContents = await Promise.all(dirs.map(d => getFilesInFolder(d, recursive)));
        rContents.forEach(dir => {
            dir.files.forEach(f => files.push(f));
            dir.dirs.forEach(d => {
                dirs.push(d);
            })
        });
    }

    return {dirs, files};
}

getFilesInFolder("./", true)
    .then(res => console.log("files in folders", res))
    .catch(err => console.error(err))

