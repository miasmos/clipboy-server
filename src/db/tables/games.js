import Sequelize from 'sequelize';
import { Table } from './table';

export class Games extends Table {
    create(name, game_id) {
        return this.model.create({
            name: name.toLowerCase(),
            game_id
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
