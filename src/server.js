import { Twitch } from './twitch';
import { celebrate, isCelebrate } from 'celebrate';
import {
    PORT,
    TWITCH_CLIENT_SECRET,
    TWITCH_CLIENT_ID,
    HOST,
    ENVIRONMENT,
    SSL_KEY_PATH,
    SSL_CERT_PATH,
    FORCE_HTTP
} from './config';
import * as validators from './validators';
const fs = require('fs');
const https = require('https');
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
    api.use(helmet());
    if (ENVIRONMENT === 'production') {
        api.use(
            rateLimit({
                windowMs: 60 * 1000,
                max: 2,
                handler: (req, res) => {
                    res.status(429).json({
                        status: 'error',
                        error: 'error.network.toomany'
                    });
                }
            })
        );
    } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    }
    api.use(
        cors({
            origin: (origin, callback) => {
                const regex = new RegExp(`^https?:\/\/(${HOST})(:|\/)?`, 'g');
                const result = regex.exec(origin);

                if (
                    (result && result.length > 0) ||
                    (ENVIRONMENT === 'development' && !origin) ||
                    origin === 'null'
                ) {
                    callback(null, true);
                    return;
                }
                callback(new Error('error.network.forbidden'));
            }
        })
    );
    api.use(bodyparser.json());
    api.get('/', (req, res) => res.json({ alive: true }));
    api.post('/clips', celebrate(validators.clips), (req, res) => requestHandler(clips, req, res));
    api.use((error, req, res, next) => {
        if (isCelebrate(error)) {
            const [{ type, path = [] }] = error.joi.details;

            const field =
                path.length > 0
                    ? '.' +
                      path.reduce((prev, path) => {
                          if (typeof path !== 'string') {
                              return prev;
                          } else {
                              return `${prev}.${path}`;
                          }
                      }, undefined)
                    : '';
            res.status(400).json({ status: 'error', error: `error${field}.${type}` });
        } else {
            next(error);
        }
    });
    api.all('*', (req, res) => {
        res.status(404).json({ status: 'error' });
    });

    await Twitch.init({ clientId: TWITCH_CLIENT_ID, clientSecret: TWITCH_CLIENT_SECRET });
    if (FORCE_HTTP === 'true') {
        api.listen(PORT || 3000, () =>
            console.log(`app listening on port ${PORT || 3000} in http mode`)
        );
    } else {
        https
            .createServer(
                {
                    key: fs.readFileSync(SSL_KEY_PATH),
                    cert: fs.readFileSync(SSL_CERT_PATH)
                },
                api
            )
            .listen(PORT || 3000, () =>
                console.log(`app listening on port ${PORT || 3000} in https mode`)
            );
    }
};
