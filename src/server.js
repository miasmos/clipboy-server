import { Twitch } from './twitch';
import { celebrate, isCelebrate, errors } from 'celebrate';
import { PORT, TWITCH_CLIENT_SECRET, TWITCH_CLIENT_ID } from './config';
import * as validators from './validators';
const rateLimit = require('express-rate-limit');
const express = require('express');
const bodyparser = require('body-parser');
const helmet = require('helmet');
const api = express();

import { clips } from './api';

const requestHandler = async (fn, req, res) => {
    try {
        const data = await fn(req);
        res.json({ status: 'success', data });
    } catch (error) {
        const { message, status } = error;
        res.status(status || 500).json({ status: 'error', message: message || error });
    }
};

export const server = async () => {
    api.use(helmet());
    api.use(bodyparser.json());
    api.use(
        rateLimit({
            windowMs: 60 * 1000,
            max: 2,
            handler: (req, res) => {
                res.status(429).json({
                    status: 'error',
                    message: 'Too many requests, try again in a bit'
                });
            }
        })
    );
    api.get('/', (req, res) => res.json({ alive: true }));
    api.post('/clips', celebrate(validators.clips), (req, res) => requestHandler(clips, req, res));
    api.use((error, req, res, next) => {
        if (isCelebrate(error)) {
            const [{ message }] = error.joi.details;
            res.status(400).json({ status: 'error', error: message || error });
        } else {
            next(error);
        }
    });

    await Twitch.init({ clientId: TWITCH_CLIENT_ID, clientSecret: TWITCH_CLIENT_SECRET });
    api.listen(PORT || 3000, () => console.log(`app listening on port ${PORT || 3000}`));
};
