import { Joi } from 'celebrate';

export const feed = {
    headers: Joi.object({
        'x-client-id': Joi.string()
            .length(11)
            .required()
    }).unknown(),
    body: Joi.object({
        id: Joi.string()
            .regex(/^\d{19}$/)
            .required()
    })
};
