import { Joi } from 'celebrate';

export const email = {
    body: Joi.object({
        body: Joi.string()
            .max(2000)
            .min(20)
            .required(),
        sender: Joi.string()
            .email()
            .required()
    })
};
