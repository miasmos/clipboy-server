const snoowrap = require('snoowrap');
const rp = require('request-promise');

const clientId = 'N5jIfrtd6tHT9Q';
const clientSecret = 'pbOgkDi4FPtqL_bm_ep__slGWfA';
const userAgent =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.132 Safari/537.36';

class RedditClass {
    snoo;

    init = async () => {
        const { access_token, expires_in } = await this.auth(clientId, clientSecret);
        this.snoo = new snoowrap({
            userAgent,
            accessToken: access_token
        });

        setInterval(async () => {
            const { access_token } = await this.refresh(this.refreshToken);
            this.snoo.refreshToken = access_token;
        }, (expires_in - 60) * 1000);
    };

    getHot = subreddit => {
        return this.snoo.getSubreddit(subreddit).getHot();
    };

    getComments = async id => {
        try {
            const thread = await this.snoo.getSubmission(id);
            return thread;
        } catch (error) {}
    };

    auth = (clientId, clientSecret, userAgent) =>
        rp({
            uri: `https://www.reddit.com/api/v1/access_token`,
            form: {
                grant_type: 'https://oauth.reddit.com/grants/installed_client',
                device_id: 'DO_NOT_TRACK_THIS_DEVICE'
            },
            headers: {
                Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
                    'base64'
                )}`,
                'User-Agent': userAgent,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            method: 'POST',
            simple: false,
            json: true
        });

    refresh = token =>
        rp({
            uri: 'https://www.reddit.com/api/v1/access_token',
            method: 'POST',
            body: {
                grant_type: 'refresh_token',
                refresh_token: token
            },
            headers: {
                'User-Agent': userAgent
            },
            simple: false,
            json: true
        });
}

export const Reddit = new RedditClass();
