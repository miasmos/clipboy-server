import { getGame, getBroadcaster } from './util';
const dayjs = require('dayjs');

export const clips = async req => {
    const { broadcaster, game, startDate, clipCount, endDate } = req.body;

    let data = {};
    if (game) {
        data = await getGame(
            game,
            dayjs(startDate, 'YYYY-MM-DD'),
            endDate ? dayjs(endDate, 'YYYY-MM-DD') : undefined,
            clipCount
        );
    } else if (broadcaster) {
        data = await getBroadcaster(
            broadcaster,
            dayjs(startDate, 'YYYY-MM-DD'),
            endDate ? dayjs(endDate, 'YYYY-MM-DD') : undefined,
            clipCount
        );
    }
    return data;
};
