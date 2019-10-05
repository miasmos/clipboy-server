var Sequelize = require('sequelize');

export class Models {
    constructor(connection) {
        this.connection = connection;

        this.broadcasters = connection.define(
            'twitch_broadcasters',
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
            'twitch_games',
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

        this.releases = connection.define(
            'releases',
            {
                id: {
                    type: Sequelize.UUID,
                    defaultValue: Sequelize.UUIDV4,
                    field: 'id',
                    primaryKey: true
                },
                version: {
                    type: Sequelize.TEXT,
                    field: 'version',
                    allowNull: false
                },
                buildId: {
                    type: Sequelize.SMALLINT,
                    field: 'buildId',
                    allowNull: false
                },
                project: {
                    type: Sequelize.STRING,
                    field: 'project',
                    allowNull: false
                },
                payload: {
                    type: Sequelize.BLOB,
                    field: 'payload'
                },
                notes: {
                    type: Sequelize.JSON,
                    field: 'notes'
                },
                name: {
                    type: Sequelize.TEXT,
                    field: 'name'
                }
            },
            {
                freezeTableName: true
            }
        );
        this.releases.sync();
    }
}
