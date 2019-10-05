import { celebrate } from 'celebrate';
import * as validators from './validators';
import { clips } from './api/twitch';
import { info, zxp } from './api/deploy';
import { manifest, version, latest } from './api/project';

const jsonResponseHandler = async (fn, req, res) => {
    try {
        const data = (await fn(req, res)) || {};
        res.json({ status: 'success', data });
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

const genericResponseHandler = async (fn, req, res) => {
    try {
        await fn(req, res);
        if (!res.headerSent) {
            res.send();
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(error.status);
    }
};

export const routes = api => {
    api.get('/', (req, res) => res.json({ alive: true }));
    api.post('/twitch/clips', celebrate(validators.clips), (req, res) =>
        jsonResponseHandler(clips, req, res)
    );
    api.put('/deploy/zxp', celebrate(validators.zxp), (req, res) =>
        genericResponseHandler(zxp, req, res)
    );
    api.post('/deploy/info', celebrate(validators.info), (req, res) =>
        jsonResponseHandler(info, req, res)
    );
    api.get('/:project/latest', celebrate(validators.latest), (req, res) =>
        genericResponseHandler(latest, req, res)
    );
    api.get('/:project/manifest', celebrate(validators.manifest), (req, res) =>
        jsonResponseHandler(manifest, req, res)
    );
    api.get('/:project/version', celebrate(validators.version), (req, res) =>
        genericResponseHandler(version, req, res)
    );
};
