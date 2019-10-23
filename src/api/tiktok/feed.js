const rp = require('request-promise');
const cookie = require('cookie');

export const feed = async req => {
    const { id } = req.body;
    const data = await rp({
        uri: `https://www.tiktok.com/share/item/list?id=${id}&type=1&count=1000&minCursor=0&maxCursor=0`,
        headers: {
            Host: 'www.tiktok.com',
            referer: 'https://www.tiktok.com',
            'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/77.0.3865.120 Safari/537.36',
            cookie: `tt_webid=6750865${Math.random()
                .toString()
                .substring(6)};`
        },
        json: true
    });
    return data;
};
