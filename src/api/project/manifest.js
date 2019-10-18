import { db } from '../../db';
import { NotFoundError } from '../../errors';
import { HOST, PROTOCOL, DOMAIN } from '../../config';

const pug = require('pug');
const fs = require('fs');
const path = require('path');
const jsonxml = require('jsontoxml');
const template = fs.readFileSync(path.resolve(__dirname, '../views/release-notes.pug')).toString();

export const manifest = async (req, res) => {
    const { project } = req.params;
    const entry = await db.releases.latest(project);

    if (entry !== null) {
        const { version, payload, notes, name } = entry;

        if (version && payload) {
            const downloadLink = `${PROTOCOL}://${HOST}/project/${project}/latest`;
            const xml = jsonxml({
                ExtensionUpdateInformation: [
                    { name: 'version', text: [version] },
                    { name: 'download', text: downloadLink },
                    {
                        name: 'description',
                        attrs: {
                            url: `${PROTOCOL}://${DOMAIN}/product/${project.replace(
                                'clipboy-',
                                ''
                            )}`
                        },
                        text: jsonxml.cdata(
                            pug.render(template, {
                                version,
                                notes,
                                name
                            })
                        )
                    }
                ]
            });
            res.set('Content-Type', 'text/xml');
            res.send(xml);
            return;
        }
    }

    throw new NotFoundError('error.generic');
};
