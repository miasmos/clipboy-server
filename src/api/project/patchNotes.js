import { db } from '../../db';
import { NotFoundError } from '../../errors';

export const patchNotes = async (req, res) => {
    const { project } = req.params;
    const entries = await db.releases.all(project);

    if (entries !== null) {
        return entries;
    }

    throw new NotFoundError('error.generic');
};
