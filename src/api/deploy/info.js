import { db } from '../../db';

export const info = async (req, res) => {
    const { version, notes, name, project } = req.body;

    const release = await db.releases.get(project, version);
    if (release && release.payload) {
        res.status(400).json({ status: 'error', error: `${version} release already exists` });
        return;
    }

    if (release) {
        await db.releases.update(project, version, { notes, name });
    } else {
        await db.releases.create(project, version, undefined, notes, name);
    }
};
