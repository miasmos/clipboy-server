const Sequelize = require('sequelize');
import { Table } from './table';

export class Broadcasters extends Table {
    create(name, broadcaster_id) {
        return this.model.create({
            name: name.toLowerCase(),
            broadcaster_id
        });
    }

    get(name) {
        return this.model.findOne({
            where: {
                name: name.toLowerCase()
            }
        });
    }

    exists(name) {
        return new Promise((resolve, reject) => {
            this.get(name)
                .then(result => {
                    if (result !== null && result.get('name')) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                })
                .catch(reject);
        });
    }
}
