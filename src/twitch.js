const rp = require('request-promise');

export class TwitchClass {
    accessToken;
    clientId;

    init = async ({ clientId, clientSecret }) => {
        const { access_token } = await rp({
            uri: `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials&scope=`,
            method: 'POST',
            json: true,
            simple: false
        });
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.accessToken = access_token;

        setTimeout(this.init, 24 * 60 * 60 * 1000);
    };

    games = game => this.get(`/games?name=${game}`);
    game = async game => {
        const games = await this.games(game);
        if (games.data && games.data.length > 0) {
            return games.data[0];
        }
        return undefined;
    };

    users = login => this.get(`/users?login=${login}`);
    user = async login => {
        const users = await this.users(login);
        if (users.data && users.data.length > 0) {
            return users.data[0];
        }
        return undefined;
    };

    clipsByGame = (gameId, start, end, count = 100) =>
        this.get(`/clips?game_id=${gameId}&started_at=${start}&ended_at=${end}&first=${count}`);

    clipsByBroadcaster = (broadcasterId, start, end, count = 100) =>
        this.get(
            `/clips?broadcaster_id=${broadcasterId}&started_at=${start}&ended_at=${end}&first=${count}`
        );

    get = async path => {
        console.log(`GET https://api.twitch.tv/helix${path}`, this.accessToken);
        return rp({
            uri: `https://api.twitch.tv/helix${path}`,
            headers: {
                Authorization: `Bearer ${this.accessToken}`
            },
            json: true,
            simple: false
        });
    };

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
