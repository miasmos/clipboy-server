import { db } from '../../db';

export const zxp = async (req, res) => {
    const payload = req.body;
    const { 'X-VERSION': version, 'X-PROJECT': project } = req.headers;

    const exists = await db.releases.exists(project, version);
    if (exists) {
        await db.releases.update(project, version, { payload });
    } else {
        await db.releases.create(project, version, payload);
    }
    res.sendStatus(201).end();
};
