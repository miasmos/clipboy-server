import { Joi } from 'celebrate';
import { BEARER_TOKEN } from '../config';

const semverRegex = new RegExp(`[0-9]{1}\.[0-9]{1}\.[0-9]{1}`, 'i');

export const zxp = {
    headers: Joi.object({
        authorization: Joi.string()
            .valid(`Bearer ${BEARER_TOKEN}`)
            .required(),
        'X-VERSION': Joi.string()
            .regex(semverRegex)
            .required(),
        'X-PROJECT': Joi.string()
            .min(1)
            .max(36)
            .required()
    }).options({ allowUnknown: true }),
    body: Joi.string().required()
};
