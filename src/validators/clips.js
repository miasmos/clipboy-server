import { Joi } from 'celebrate';

export const clips = {
    headers: Joi.object({
        'x-client-id': Joi.string()
            .length(11)
            .required()
    }).unknown(),
    body: Joi.object({
        game: Joi.string(),
        broadcaster: Joi.string(),
        startDate: Joi.date()
            .iso()
            .required()
            .max(Joi.ref('endDate')),
        endDate: Joi.date()
            .iso()
            .less('now'),
        clipCount: Joi.number()
            .integer()
            .min(10)
            .max(100)
            .required()
    }).xor('game', 'broadcaster')
};
