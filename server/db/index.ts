import { Level } from 'level';
import * as express from "express";
import { route } from '../util';

const prefixes = [
    "os.system",
    "os.terminal",
    "os.filemanager",
    "os.music"
];

const db = new Level(__dirname + '/../../data', { valueEncoding: 'json' });

export const systemdb = db.sublevel("os.system", { valueEncoding: "json", separator: '\x01' });


const databases = prefixes.map(p => ({ prefix: p, db: db.sublevel(p, { valueEncoding: 'json' }) }));

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
        ids.push(key.split('!').pop());
    }
    ids = ids.filter(i => i != 'NaN');

    ids.sort();
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
            ids.push(key);
        }
        ids.sort();

        // TODO: facilitate odata-like filtering.
        res.send(await db.getMany(ids));
        return;
    }

}));


export const DataApi = router;
