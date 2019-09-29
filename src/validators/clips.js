import { Joi } from 'celebrate';

export const clips = {
    body: Joi.object()
        .keys({
            game: Joi.string(),
            broadcaster: Joi.string(),
            start: Joi.date()
                .iso()
                .required(),
            end: Joi.date().iso(),
            count: Joi.number()
                .integer()
                .min(1)
                .max(100)
        })
        .xor('game', 'broadcaster')
};
