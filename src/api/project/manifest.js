const jsonxml = require('jsontoxml');
import { db } from '../../db';
import { NotFoundError } from '../../errors';
import { HOST } from '../../config';

export const manifest = async (req, res) => {
    const { project } = req.params;
    const entry = await db.releases.latest(project);
    console.log(entry);
    if (entry !== null) {
        const { version, payload, notes } = entry;

        if (version && payload) {
            const xml = jsonxml({
                ExtensionUpdateInformation: [
                    { name: 'version', text: [version] },
                    { name: 'download', text: `http://${HOST}/${project}/latest` },
                    {
                        name: 'description',
                        attrs: { url: `http://${HOST}/${project}` },
                        text: notes ? jsonxml.cdata(notes.join('<br/>')) : ''
                    }
                ]
            });
            res.set('Content-Type', 'text/xml');
            res.send(xml);
            return;
        }
    }

    throw new NotFoundError();
};
