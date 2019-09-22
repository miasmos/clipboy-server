import { getGame } from './app';
const dayjs = require('dayjs');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const port = 3000;

export const server = () => {
    app.use(bodyparser());
    app.get('/', (req, res) => res.json({ alive: true }));
    app.post('/clips', async (req, res) => {
        const { oauth, game, start, count, end } = req.body;
        console.log('GET /clips');

        if (!oauth) {
            res.status(400).json({ code: 1, message: 'oauth token is required' });
            return;
        }
        if (!game) {
            res.status(400).json({ code: 2, message: 'game is required' });
            return;
        }
        if (!start) {
            res.status(400).json({ code: 3, message: 'start is required' });
            return;
        }

        if (count) {
            if (isNaN(count)) {
                res.status(400).json({ code: 5, message: 'count should be an int' });
                return;
            } else if (Number(count) < 1 || Number(count) > 100) {
                res.status(400).json({ code: 6, message: 'count must be between 1 and 100' });
                return;
            }
        }

        let regex = start.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
        if (!(regex && regex.length > 0)) {
            res.status(400).json({ code: 7, message: 'start must be YYYY-MM-DD' });
            return;
        }
        if (end) {
            regex = end.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
            if (!(regex && regex.length > 0)) {
                res.status(400).json({ code: 7, message: 'end must be YYYY-MM-DD' });
                return;
            }
        }

        if (oauth.length !== 30) {
            res.status(400).json({ code: 8, message: 'oauth must be of length 30' });
            return;
        }

        try {
            const data = await getGame(
                game,
                dayjs(start, 'YYYY-MM-DD'),
                end ? dayjs(end, 'YYYY-MM-DD') : undefined,
                oauth,
                count
            );
            res.json(data);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: error });
        }
    });

    app.listen(port, () => console.log(`app listening on port ${port}`));
};
