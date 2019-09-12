const rp = require('request-promise');

const clientId = 'nwyn2lqqardyi2j2b9yocgo5uh3i91';
const clientSecret = 'wvhgutvtw8oo21o6q7d1b54vsxk51x';
const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36';

export class TwitchClass {
    accessToken;
    clientId;
    oauthToken;

    constructor(oauthToken) {
        this.oauthToken = oauthToken;
    }

    init = async oauthToken => {
        const { access_token } = await rp({
            uri: `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=`,
            method: 'POST',
            json: true,
            simple: false
        });
        this.oauthToken = oauthToken;
        this.accessToken = access_token;
        this.clientId = await this.getClientId();

        setTimeout(this.init, 24 * 60 * 60 * 1000);
    };

    getClientId = async () => {
        const homepage = await rp({ uri: 'https://twitch.tv', simple: false });
        let regex = new RegExp(
            '(https://static.twitchcdn.net/assets/core-[a-z0-9]{19,22}.js)',
            'g'
        );
        const playerUiScriptUri = regex.exec(homepage);
        let uri;

        if (playerUiScriptUri && playerUiScriptUri.length > 1) {
            uri = playerUiScriptUri[1];
        }

        if (uri) {
            const playerUiScript = await rp({ uri, simple: false });
            regex = new RegExp('.clientID:"([a-z0-9]{29,32})"', 'g');
            const clientIdMatch = regex.exec(playerUiScript);

            if (clientIdMatch && clientIdMatch.length > 1) {
                return clientIdMatch[1];
            }
        }

        return undefined;
    };

    game = game => this.get(`/games?name=${game}`);

    clips = (gameId, start, count = 100) =>
        this.get(`/clips?game_id=${gameId}&started_at=${start}&first=${count}`);

    // hardcode the OAuth token as it requires a user that is auth'd with the Twitch site
    clipData = async slug => {
        const clip = await rp({
            uri: 'https://gql.twitch.tv/gql',
            method: 'post',
            body: {
                query:
                    '\n    query getClipStatus($slug:ID!) {\n        clip(slug: $slug) {\n            creationState\n            videoQualities {\n              frameRate\n              quality\n              sourceURL\n            }\n          }\n    }\n',
                variables: { slug }
            },
            headers: {
                Authorization: `OAuth ${this.oauthToken}`,
                'Client-ID': this.clientId,
                'Content-Type': 'application/json',
                DNT: 1,
                Origin: 'https://clips.twitch.tv',
                Referer: `https://clips.twitch.tv/${slug}`,
                'Sec-Fetch-Mode': 'cors',
                'User-Agent': userAgent,
                'X-Device-Id': Buffer.from(Math.random().toString())
                    .toString('base64')
                    .slice(0, 16)
            },
            json: true
        });

        if (clip && clip.data.clip.videoQualities.length) {
            const { sourceURL } = clip.data.clip.videoQualities.sort(
                (a, b) => b.quality - a.quality
            )[0];

            const data = await rp({ uri: sourceURL, encoding: null, simple: false });
            return data;
        }

        throw new Error('Failed to get clip data. Is your oauth token valid?');
    };

    thumbnailData = uri =>
        rp({
            uri,
            encoding: null,
            simple: false
        });

    get = async path =>
        rp({
            uri: `https://api.twitch.tv/helix${path}`,
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            json: true,
            simple: false
        });

    post = async path =>
        rp({
            uri: `https://api.twitch.tv/helix${path}`,
            method: 'POST',
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            json: true,
            simple: false
        });
}

export const Twitch = new TwitchClass();
