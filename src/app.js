require('@babel/register');
require('@babel/polyfill');
import { Twitch } from './twitch';
const fs = require('fs');
const path = require('path');

const fsp = fs.promises;

export const getGame = async (name, start, oauth, targetPath, clipCount = 100) => {
    try {
        await fsp.stat(path.resolve(__dirname, targetPath));
    } catch {
        await fsp.mkdir(path.resolve(__dirname, targetPath), { recursive: true });
    }

    try {
        await Twitch.init(oauth);
        const game = await Twitch.game(name);
        const startedAt = start.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        const clips = await Twitch.clips(game.data[0].id, startedAt);
        const filtered = clips.data
            .filter(clip => {
                const hasDomain = clip.title.match(/\.(com|net|ca)/i);
                return !(hasDomain && hasDomain.length > 0);
            })
            .filter(clip => clip.language === 'en')
            .sort((a, b) => b.view_count - a.view_count)
            .slice(0, clipCount);

        await Promise.all(
            filtered.map(async ({ id, thumbnail_url }) => {
                try {
                    // if it doesn't exist, throw an error and download
                    await fsp.stat(path.resolve(__dirname, targetPath, `${id}.mp4`));
                } catch {
                    const clipData = await Twitch.clipData(id);
                    await fsp.writeFile(path.resolve(__dirname, targetPath, `${id}.mp4`), clipData);
                }

                try {
                    // if it doesn't exist, throw an error and download
                    await fsp.stat(path.resolve(__dirname, targetPath, `${id}.jpg`));
                } catch {
                    const thumbData = await Twitch.thumbnailData(thumbnail_url);
                    await fsp.writeFile(
                        path.resolve(__dirname, targetPath, `${id}.jpg`),
                        thumbData
                    );
                }
            })
        );

        const data = filtered.reduce((prev, clip) => {
            prev[clip.id] = clip;
            return prev;
        }, {});
        return data;
    } catch (error) {
        console.error(error);
        throw new Error('Oh no');
    }
};
