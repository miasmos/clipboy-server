import { Twitch } from '../../twitch';
import dayjs from 'dayjs';
import { db } from '../../db';
import { HTTPError, NotFoundError } from '../../errors';

export const getBroadcaster = async (name, start, end, clipCount = 100) => {
    const record = await db.broadcasters.get(name);
    let exists = record !== null;
    let id;

    if (exists) {
        id = record.broadcaster_id;
    } else {
        const user = await Twitch.user(name);
        if (typeof user === 'undefined') {
            throw new NotFoundError('error.broadcaster.notfound');
        }
        ({ id } = user);
        await db.broadcasters.create(name, id);
    }

    const startedAt = start.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endedAt = end
        ? end.format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        : dayjs().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const clips = await Twitch.clipsByBroadcaster(id, startedAt, endedAt);
    const response = filterClips(clips, clipCount);
    return response;
};

export const getGame = async (name, start, end, clipCount = 100) => {
    const record = await db.games.get(name);
    let exists = record !== null;
    let id;

    if (exists) {
        id = record.game_id;
    } else {
        const game = await Twitch.game(name);
        if (typeof game === 'undefined') {
            throw new NotFoundError('error.game.notfound');
        }
        ({ id } = game);
        await db.games.create(name, id);
    }

    const startedAt = start.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const endedAt = end
        ? end.format('YYYY-MM-DDTHH:mm:ss') + 'Z'
        : dayjs().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
    const clips = await Twitch.clipsByGame(id, startedAt, endedAt);
    const response = filterClips(clips, clipCount);
    return response;
};

const filterClips = (clips, clipCount = 100) => {
    if (!clips.data) {
        throw new HTTPError('error.clips.failed');
    }

    const filtered = clips.data
        .filter(clip => {
            const hasDomain = clip.title.match(/\.(com|net|ca)/i);
            return !(hasDomain && hasDomain.length > 0);
        })
        .sort((a, b) => b.view_count - a.view_count)
        .slice(0, clipCount)
        .map(({ embed_url, creator_id, creator_name, video_id, game_id, language, ...data }) => {
            const domain = data.thumbnail_url.substring(0, data.thumbnail_url.indexOf('.tv') + 3);
            const id = data.thumbnail_url.substring(
                domain.length + 1,
                data.thumbnail_url.indexOf('-preview')
            );
            return { ...data, clip_url: `${domain}/${id}.mp4` };
        });

    if (filtered.length === 0) {
        throw new HTTPError('error.clips.notfound');
    }

    return filtered;
};
