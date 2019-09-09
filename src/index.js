require('@babel/register');
require('@babel/polyfill');
import { Twitch } from './twitch';
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');

const fsp = fs.promises;

let outputFolder = './clips';
// hardcode the OAuth token as it requires a user that is auth'd with the Twitch site
const oauthToken = '8gw94dtfjkrhk4sas0t3i70j0njgd2';

const getGame = async (name, start) => {
    try {
        await Twitch.init(oauthToken);
        const game = await Twitch.game(name);
        const startedAt = start.format('YYYY-MM-DDTHH:mm:ss') + 'Z';
        const clips = await Twitch.clips(game.data[0].id, startedAt);

        await Promise.all(
            clips.data.map(async ({ id, broadcaster_name, title, view_count, thumbnail_url }) => {
                const clipData = await Twitch.clipData(id);
                const thumbData = await Twitch.thumbnailData(thumbnail_url);
                await fsp.writeFile(path.resolve(__dirname, outputFolder, `${id}.mp4`), clipData);
                await fsp.writeFile(path.resolve(__dirname, outputFolder, `${id}.jpg`), thumbData);
                console.log(
                    `Wrote ${id} by broadcaster ${broadcaster_name} titled ${title} (${view_count} views)`
                );
            })
        );

        const data = clips.data.reduce((prev, clip) => {
            prev[clip.id] = clip;
            return prev;
        }, {});
        const filename = start.format('YYYY-MM-DD');
        await fsp.writeFile(
            path.resolve(__dirname, outputFolder, `${filename}.json`),
            JSON.stringify(data),
            undefined,
            2
        );
    } catch (error) {
        console.error(error);
    }
};

(async () => {
    const gameName = 'Just Chatting';
    outputFolder = `${outputFolder}/${gameName}`;
    try {
        await fsp.stat(path.resolve(__dirname, outputFolder));
    } catch (error) {
        await fsp.mkdir(path.resolve(__dirname, outputFolder), { recursive: true });
    }

    const start = dayjs().subtract(7, 'day');
    await getGame(gameName, start);
    process.exit(0);
})();
