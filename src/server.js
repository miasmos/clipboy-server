import { Twitch } from './twitch';
import { celebrate, isCelebrate } from 'celebrate';
import { PORT, TWITCH_CLIENT_SECRET, TWITCH_CLIENT_ID, HOST, ENVIRONMENT } from './config';
import * as validators from './validators';
const rateLimit = require('express-rate-limit');
const express = require('express');
const bodyparser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');
const api = express();

import { clips } from './api';

const requestHandler = async (fn, req, res) => {
    try {
        const data = await fn(req);
        res.json({ status: 'success', data });
    } catch (error) {
        const { message, status } = error;
        res.status(status || 500).json({ status: 'error', error: message || error });
    }
};

export const server = async () => {
    if (ENVIRONMENT === 'production') {
        api.use(helmet());
        api.use(
            cors({
                origin: (origin, callback) => {
                    const regex = new RegExp(`^https?:\/\/(${HOST})(:|\/)?`, 'g');
                    const result = regex.exec(origin);

                    if ((result && result.length > 0) || !origin || origin === 'null') {
                        callback(null, true);
                        return;
                    }
                    callback(new Error('CORS error'));
                }
            })
        );
        api.use(
            rateLimit({
                windowMs: 60 * 1000,
                max: 2,
                handler: (req, res) => {
                    res.status(429).json({
                        status: 'error',
                        error: 'Too many requests, try again in a bit'
                    });
                }
            })
        );
    }
    api.use(bodyparser.json());
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
    api.all('*', (req, res) => {
        res.status(404).json({ status: 'error' });
    });

    await Twitch.init({ clientId: TWITCH_CLIENT_ID, clientSecret: TWITCH_CLIENT_SECRET });
    api.listen(PORT || 3000, () => console.log(`app listening on port ${PORT || 3000}`));
};
