import { Joi } from 'celebrate';

export const version = {
    params: Joi.object({
        project: Joi.string()
            .min(1)
            .max(36)
            .required()
    })
};
