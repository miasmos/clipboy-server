import { db } from '../../db';

export const info = async req => {
    const { version, notes, name, project } = req.body;

    const exists = await db.releases.exists(project, version);
    if (exists) {
        await db.releases.update(project, version, { notes, name });
    } else {
        await db.releases.create(project, version, undefined, notes, name);
    }
};
