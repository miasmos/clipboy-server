import { Sendgrid } from '../../sendgrid';

export const send = async (req, res) => {
    const { sender, body } = req.body;
    await Sendgrid.send(sender, body);
    return {};
};
