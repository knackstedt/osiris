import { Level } from 'level';
import * as express from "express";
import { route } from '../util';

const db = new Level(__dirname + '/../../data', { valueEncoding: 'json' });

const prefixes = [
    "os.system",
    "os.terminal",
    "os.filemanager",
    "os.music"
];

const databases = prefixes.map(p => ({ prefix: p, db: db.sublevel(p, { valueEncoding: 'json' }) }));

export const systemdb       = databases.find(d => d.prefix == "os.system").db;
export const terminaldb     = databases.find(d => d.prefix == "os.terminal").db;
export const filemanagerdb  = databases.find(d => d.prefix == "os.filemanager").db;
export const musicdb        = databases.find(d => d.prefix == "os.music").db;

const router = express.Router();


const parseUrl = (url: string) => {
    const source = url.split('(')[0];
    const match = url.match(/(?<=\()\d+(?=\))/);
    const itemId = match ? parseInt(match[0]) : null;

    return {
        source,
        itemId
    };
}

router.use('/:source', (req, res, next) => {
    const prefix = req.params.source?.split('(')[0];
    const db = databases.find(d => d.prefix == prefix);

    if (!db)
        return next(404);

    next();
});

/**
 * POST: Create new entry in table via JSON payload.
 */
router.post('/:source', route(async (req, res, next) => {
    const { source } = parseUrl(req.params['source']);
    const { db } = databases.find(d => d.prefix == source);

    let ids = []
    for await (const key of db.keys()) {
        ids.push(parseInt(key.split('!').pop()));
    }
    ids = ids.filter(i => i != 'NaN');

    ids.sort((a, b) => a - b);

    const itemId = (parseInt(ids.pop()) + 1) || 1;
    const data = req.body;
    data['_id'] = itemId;
    await db.put(itemId.toString(), data);

    res.send({ created: [itemId] });
}));

/**
 * PATCH: Update entry in table via numeric ID and JSON payload.
 */
router.patch('/:source', route(async (req, res, next) => {
    const { source, itemId } = parseUrl(req.params['source']);
    const { db } = databases.find(d => d.prefix == source);

    const data = req.body;
    data['_id'] = itemId;

    res.send(await db.put(itemId.toString(), req.body));
}));

/**
 * DELETE: Delete entry from table via numeric ID
 * TODO: soft delete
 */
router.delete('/:source', route(async (req, res, next) => {
    const { source, itemId } = parseUrl(req.params['source']);
    const { db } = databases.find(d => d.prefix == source);

    res.send(await db.del(itemId.toString()));
}));

/**
 * GET: Get the item(s) from the specified table.
 */
router.get('/:source', route(async (req, res, next) => {
    const { source, itemId } = parseUrl(req.params['source']);
    const { db } = databases.find(d => d.prefix == source);

    if (itemId) {
        res.send(await db.get(itemId.toString()));
        return;
    }
    else {

        let ids = [];
        for await (const key of db.keys()) {
            let v = parseInt(key);
            ids.push(Number.isNaN(v) ? key : v);
        }
        ids.sort((a, b) => a - b);

        // TODO: facilitate odata-like filtering.
        res.send(await db.getMany(ids));
        return;
    }

}));

router.use('/:source/keys', route(async (req, res, next) => {
    const { source } = parseUrl(req.params['source']);
    const { db } = databases.find(d => d.prefix == source);

    let ids = [];
    for await (const key of db.keys()) {
        let v = parseInt(key.split('!').pop());
        ids.push(Number.isNaN(v) ? key : v);
    }

    ids.sort((a, b) => a-b);

    res.send(ids);
}));

export const DataApi = router;
