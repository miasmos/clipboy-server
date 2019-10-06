import { db } from '../../db';

export const zxp = async (req, res) => {
    if (!('text' in req) || !req.text || req.text.length < 100) {
        res.sendStatus(400).json({ status: 'error', error: 'Payload was empty' });
        return;
    }

    const payload = req.text;
    const { 'x-version': version, 'x-project': project } = req.headers;

    const latest = await db.releases.latest(project);
    if (latest && latest.payload && latest.version === version) {
        res.status(400).json({ status: 'error', error: `${version} release already exists` });
        return;
    }

    const exists =
        (latest && latest.version === version) || (await db.releases.exists(project, version));
    if (exists) {
        await db.releases.update(project, version, { payload });
        res.sendStatus(200).end();
    } else {
        await db.releases.create(project, version, payload);
        res.sendStatus(201).end();
    }
};
