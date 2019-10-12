import { db } from '../../db';
import { NotFoundError } from '../../errors';

import { PROTOCOL, HOST, PORT } from '../../config';

export const releaseNotes = async (req, res) => {
    const { project } = req.params;
    const entry = await db.releases.latest(project);

    if (entry !== null) {
        const { version, payload } = entry;

        if (version && payload) {
            res.render('release-notes', {
                ...entry,
                download: `${PROTOCOL}://${HOST}:${PORT}/project/${project}/latest`
            });
            return;
        }
    }

    throw new NotFoundError('error.generic');
};
