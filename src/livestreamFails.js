const rp = require('request-promise');

class LivestreamFailsClass {
    getVideo = async post => {
        const source = await this.getSource(`https://livestreamfails.com/post/${post}`);
        const uri = await this.getVideoUrlFromSource(source);

        if (uri) {
            const video = await rp({
                uri,
                encoding: null
            });
            return video;
        }

        return undefined;
    };

    getVideoUrlFromSource = source => {
        let regex = new RegExp('<meta property="og:video" content="(.*)" />', 'g');
        const headerUrl = regex.exec(source);
        if (headerUrl && headerUrl.length > 1) {
            return headerUrl[1];
        }

        regex = new RegExp('<source src="(.*)" type="video/mp4" />', 'g');
        const bodyUrl = regex.exec(source);
        if (bodyUrl && bodyUrl.length > 1) {
            return bodyUrl[1];
        }

        return undefined;
    };

    getSource = uri => rp({ uri });
}

export const LivestreamFails = new LivestreamFailsClass();
