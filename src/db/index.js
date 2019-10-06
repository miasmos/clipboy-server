const Sequelize = require('sequelize');
import { DB_HOST, DB_USER, DB_PASSWORD, DB_PORT, DB_NAME } from '../config';
import pg from 'pg';
import { Models } from './models';
import * as Tables from './tables';

let instance = undefined;
delete pg.native; // fixes compile-time issue

class DbClass {
    constructor({ user, password, host, port, database }) {
        if (!instance) {
            instance = this;
        } else {
            return instance;
        }

        this.user = user;
        this.password = password;
        this.host = host || 'localhost';
        this.port = port || 5432;
        this.database = database;
        this.connect();

        this.models = new Models(this.connection);
        Object.entries(Tables).forEach(([name, table]) => {
            const internalName = name.toLowerCase();
            if (!(internalName in this && internalName in this.models)) {
                this[internalName] = new table(this.models[internalName]);
            }
        });

        return instance;
    }

    connect() {
        this.connection = new Sequelize(this.database, this.user, this.password, {
            host: this.host,
            port: this.port,
            logging: false,
            dialectModule: pg,
            dialect: 'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 10000
            }
        });
    }
}

export const db = new DbClass({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT
});
