import { SENDGRID_API_KEY, SENDGRID_SUBJECT, SENDGRID_TO, SENDGRID_FROM } from './config';

const sendgridApi = require('@sendgrid/mail');

class SendgridClass {
    constructor() {
        sendgridApi.setApiKey(SENDGRID_API_KEY);
    }

    send(sender, body) {
        return sendgridApi.send({
            to: SENDGRID_TO,
            from: SENDGRID_FROM,
            subject: `${SENDGRID_SUBJECT} : ${sender}`,
            text: body
        });
    }
}

export const Sendgrid = new SendgridClass();
