const Sequelize = require('sequelize');
import { Table } from './table';

export class Games extends Table {
    create(name, game_id) {
        return this.model.create({
            name,
            game_id
        });
    }

    get(name) {
        return this.model.findOne({
            where: {
                name
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
