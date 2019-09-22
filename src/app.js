require('@babel/register');
require('@babel/polyfill');
import { Twitch } from './twitch';
import dayjs from 'dayjs';
const fs = require('fs');
const path = require('path');

const fsp = fs.promises;

Promise.series = providers => {
    const ret = Promise.resolve(null);
    const results = [];

    return providers
        .reduce(function(result, provider, index) {
            return result.then(function() {
                return provider().then(function(val) {
                    results[index] = val;
                });
            });
        }, ret)
        .then(function() {
            return results;
        });
};

export const getGame = async (name, start, end, oauth, clipCount = 100) => {
    try {
        await Twitch.init(oauth);
        const game = await Twitch.game(name);
        const startedAt = start.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        const endedAt = end
            ? end.format('YYYY-MM-DDTHH:mm:ss') + 'Z'
            : dayjs().format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        const clips = await Twitch.clips(game.data[0].id, startedAt, endedAt);

        if (!clips.data) {
            console.error(clips);
            throw new Error('Failed to get clips');
        }
        const filtered = clips.data
            .filter(clip => {
                const hasDomain = clip.title.match(/\.(com|net|ca)/i);
                return !(hasDomain && hasDomain.length > 0);
            })
            .filter(clip => clip.language === 'en')
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, clipCount);

        const data = await Promise.series(
            filtered.map(
                ({
                    embed_url,
                    creator_id,
                    creator_name,
                    video_id,
                    game_id,
                    language,
                    ...data
                }) => async () => {
                    const url = await Twitch.clipUrl(data.id);
                    return { ...data, clip_url: url };
                }
            )
        );

        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Oh no');
    }
};
