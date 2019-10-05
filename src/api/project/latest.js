import { db } from '../../db';
import { NotFoundError } from '../../errors';

export const latest = async (req, res) => {
    const { project } = req.params;
    const entry = await db.releases.latest(project);
    if (entry !== null) {
        const { payload } = entry;

        if (payload) {
            return payload;
        }
    }

    throw new NotFoundError();
};
