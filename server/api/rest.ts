import * as express from "express";
import { route, getFilesInFolder } from '../util';
import os from 'os';

const router = express.Router();

router.get('/', route(async (req, res, next) => {

    res.send({
        host: os.hostname(),
        user: os.userInfo()
    });
}));

export const RestApi = router;
