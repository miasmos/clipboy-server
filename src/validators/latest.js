import { Joi } from 'celebrate';

export const latest = {
    params: Joi.object({
        project: Joi.string()
            .min(1)
            .max(36)
            .required()
    })
};
