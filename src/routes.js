import { celebrate } from 'celebrate';
import * as validators from './validators';
import { clips } from './api/twitch';
import { info, zxp } from './api/deploy';
import { send } from './api/email';
import { manifest, version, latest, releaseNotes, patchNotes } from './api/project';

const rawbody = require('raw-body');
const contentType = require('content-type');

const responseHandler = async (fn, req, res) => {
    if (res.headersSent) {
        return;
    }

    try {
        const data = await fn(req, res);
        if (res.headersSent) {
            return;
        }

        switch (typeof data) {
            case 'object':
                if (Buffer.isBuffer(data)) {
                    res.send(data);
                } else {
                    res.json({ status: 'success', data });
                }
                break;
            default:
                res.send(data);
                break;
        }
    } catch (error) {
        let { message } = error;
        const { status } = error;
        if (!message) {
            const isKeyedError = error.match(/^([a-zA-Z]+\.)+[a-zA-Z]+$/g).length > 0;
            message = isKeyedError ? error : 'error.generic';
        }
        console.error(message, error);
        res.status(status || 500).json({ status: 'error', error: message || error });
    }
};

const binaryRequestHandler = (req, res, next) =>
    rawbody(
        req,
        {
            length: req.headers['content-length'],
            limit: '4mb',
            encoding: contentType.parse(req).parameters.charset
        },
        (error, string) => {
            if (error) {
                next(error);
                return;
            }
            req.text = string;
            next();
        }
    );

export const routes = api => {
    api.get('/', (req, res) => res.json({ alive: true }));
    api.post('/twitch/clips', celebrate(validators.clips), (req, res) =>
        responseHandler(clips, req, res)
    );
    api.put('/deploy/zxp', celebrate(validators.zxp), binaryRequestHandler, (req, res) =>
        responseHandler(zxp, req, res)
    );
    api.post('/deploy/info', celebrate(validators.info), (req, res) =>
        responseHandler(info, req, res)
    );
    api.get('/project/:project/latest', celebrate(validators.latest), (req, res) =>
        responseHandler(latest, req, res)
    );
    api.get('/project/:project/manifest', celebrate(validators.manifest), (req, res) =>
        responseHandler(manifest, req, res)
    );
    api.get('/project/:project/version', celebrate(validators.version), (req, res) =>
        responseHandler(version, req, res)
    );
    api.get('/project/:project/release-notes', celebrate(validators.version), (req, res) =>
        responseHandler(releaseNotes, req, res)
    );
    api.get('/project/:project/patch-notes', celebrate(validators.version), (req, res) =>
        responseHandler(patchNotes, req, res)
    );
    api.post('/email/send', celebrate(validators.email), (req, res) => {
        responseHandler(send, req, res);
    });
};
