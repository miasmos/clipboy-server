import { Joi } from 'celebrate';
import { BEARER_TOKEN } from '../config';

const semverRegex = new RegExp(`[0-9]{1}\.[0-9]{1}\.[0-9]{1}`, 'i');

export const zxp = {
    headers: Joi.object({
        authorization: Joi.string()
            .valid(`Bearer ${BEARER_TOKEN}`)
            .required(),
        'x-version': Joi.string()
            .regex(semverRegex)
            .required(),
        'x-project': Joi.string()
            .min(1)
            .max(36)
            .required()
    }).options({ allowUnknown: true })
};
