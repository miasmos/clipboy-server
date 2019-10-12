import Sequelize, { Op } from 'sequelize';
import { Table } from './table';

export class Releases extends Table {
    create(project, version, payload, notes, name) {
        const buildId = Number(version.replace(/\./g, ''));
        return this.model.create({
            project,
            payload,
            version,
            buildId,
            notes,
            name
        });
    }

    update(project, version, fields) {
        return this.model.update(fields, {
            where: { project, version }
        });
    }

    latest(project) {
        return this.model.findOne({
            where: { project, payload: { [Op.ne]: 'undefined' } },
            order: [['buildId', 'DESC']],
            raw: true
        });
    }

    all(project) {
        return this.model.findAll({
            attributes: ['id', 'version', 'notes', 'name', 'updatedAt'],
            where: { project, payload: { [Op.ne]: 'undefined' } },
            order: [['buildId', 'DESC']],
            limit: 5,
            raw: true
        });
    }

    get(project, version) {
        return this.model.findOne({
            where: {
                project,
                ...(version && { version })
            }
        });
    }

    exists(project, version) {
        return new Promise((resolve, reject) => {
            this.get(project, version)
                .then(result => {
                    if (result !== null && result.get('project')) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(reject);
        });
    }
}
