import { db } from '../../db';
import { NotFoundError } from '../../errors';

export const version = async (req, res) => {
    const { project } = req.params;
    const entry = await db.releases.latest(project);
    if (entry !== null) {
        const { version } = entry;

        if (version) {
            res.send(version);
            return;
        }
    }

    throw new NotFoundError('error.generic');
};
