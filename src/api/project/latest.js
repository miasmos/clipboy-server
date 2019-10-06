import { db } from '../../db';
import { NotFoundError } from '../../errors';

export const latest = async (req, res) => {
    const { project } = req.params;
    const entry = await db.releases.latest(project);
    if (entry !== null) {
        const { payload } = entry;

        if (payload) {
            res.set('Content-Type', 'application/octet-stream');
            res.set('Content-Length', payload.length);
            res.set('Content-Disposition', `attachment;filename=package.zxp`);
            return payload;
        }
    }

    throw new NotFoundError();
};
