import { Joi } from 'celebrate';
import { BEARER_TOKEN } from '../config';

const semverRegex = new RegExp(`[0-9]{1}\.[0-9]{1}\.[0-9]{1}`, 'i');

export const info = {
    headers: Joi.object({
        authorization: Joi.string()
            .valid(`Bearer ${BEARER_TOKEN}`)
            .required()
    }).options({ allowUnknown: true }),
    body: Joi.object({
        version: Joi.string()
            .regex(semverRegex)
            .required(),
        notes: Joi.array()
            .items(Joi.string().required())
            .required(),
        name: Joi.string().max(255),
        project: Joi.string()
            .min(1)
            .max(36)
            .required()
    })
};
