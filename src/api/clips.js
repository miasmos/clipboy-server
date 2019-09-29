import { getGame, getBroadcaster } from '../util';
const dayjs = require('dayjs');

export const clips = async req => {
    const { broadcaster, game, start, count, end } = req.body;

    let data = {};
    if (game) {
        data = await getGame(
            game,
            dayjs(start, 'YYYY-MM-DD'),
            end ? dayjs(end, 'YYYY-MM-DD') : undefined,
            count
        );
    } else if (broadcaster) {
        data = await getBroadcaster(
            broadcaster,
            dayjs(start, 'YYYY-MM-DD'),
            end ? dayjs(end, 'YYYY-MM-DD') : undefined,
            count
        );
    }
    return data;
};
