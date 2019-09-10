require('@babel/register');
require('@babel/polyfill');
import { Twitch } from './twitch';
const fs = require('fs');
const path = require('path');
const dayjs = require('dayjs');
const yargs = require('yargs');

const fsp = fs.promises;

yargs
    .option('oauth', {
        alias: 'o',
        default: false
    })
    .option('path', {
        alias: 'p',
        default: false
    })
    .option('game', {
        alias: 'g',
        default: false
    })
    .option('start', {
        alias: 's',
        default: false
    });

const getGame = async ({ game: name, start, oauth, path: targetPath }) => {
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
            .slice(0, 30);

        await Promise.all(
            filtered.map(async ({ id, broadcaster_name, title, view_count, thumbnail_url }) => {
                const clipData = await Twitch.clipData(id);
                const thumbData = await Twitch.thumbnailData(thumbnail_url);
                await fsp.writeFile(path.resolve(__dirname, targetPath, `${id}.mp4`), clipData);
                await fsp.writeFile(path.resolve(__dirname, targetPath, `${id}.jpg`), thumbData);
                console.log(
                    `Wrote ${id} by broadcaster ${broadcaster_name} titled ${title} (${view_count} views)`
                );
            })
        );

        const data = filtered.reduce((prev, clip) => {
            prev[clip.id] = clip;
            return prev;
        }, {});
        const filename = start.format('YYYY-MM-DD');
        await fsp.writeFile(
            path.resolve(__dirname, targetPath, `data.json`),
            JSON.stringify(data),
            undefined,
            2
        );
    } catch (error) {
        console.error(error);
    }
};

const getConfig = () => {
    let config = {};

    if (yargs.argv.oauth || yargs.argv.o) {
        config.oauth = yargs.argv.oauth || yargs.argv.o;
    } else {
        console.error('oauth token is required');
        process.exit(1);
    }

    if (yargs.argv.path || yargs.argv.p) {
        config.path = yargs.argv.path || yargs.argv.p;
    } else {
        console.error('path is required');
        process.exit(1);
    }

    if (yargs.argv.game || yargs.argv.g) {
        config.game = yargs.argv.game || yargs.argv.g;
    } else {
        console.error('game is required');
        process.exit(1);
    }

    if (yargs.argv.start || yargs.argv.s) {
        const isValid = (yargs.argv.start || yargs.argv.s).match(/^[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
        if (!(isValid && isValid.length > 0)) {
            console.error('invalid start supplied, must be YYYY-MM-DD');
        }
        config.start = dayjs(yargs.argv.start || yargs.argv.s, 'YYYY-MM-DD');
    } else {
        console.error('start is required');
        process.exit(1);
    }

    return config;
};

(async () => {
    const config = getConfig();
    try {
        await fsp.stat(path.resolve(__dirname, config.path));
    } catch (error) {
        await fsp.mkdir(path.resolve(__dirname, config.path), { recursive: true });
    }
    await getGame(config);
    process.exit(0);
})();
