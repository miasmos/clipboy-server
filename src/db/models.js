var Sequelize = require('sequelize');

export class Models {
    constructor(connection) {
        this.connection = connection;

        this.broadcasters = connection.define(
            'Broadcasters',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    field: 'id',
                    primaryKey: true
                },
                name: {
                    type: Sequelize.TEXT,
                    field: 'name',
                    allowNull: false
                },
                broadcaster_id: {
                    type: Sequelize.TEXT,
                    field: 'broadcaster_id',
                    allowNull: false
                }
            },
            {
                freezeTableName: true
            }
        );
        this.broadcasters.sync();

        this.games = connection.define(
            'Games',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    field: 'id',
                    primaryKey: true
                },
                name: {
                    type: Sequelize.TEXT,
                    field: 'name',
                    allowNull: false
                },
                game_id: {
                    type: Sequelize.TEXT,
                    field: 'game_id',
                    allowNull: false
                }
            },
            {
                freezeTableName: true
            }
        );
        this.games.sync();
    }
}
