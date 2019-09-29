import { HTTPError } from './httpError';

export class BadRequestError extends HTTPError {
    constructor(message) {
        super(message, 400);
    }
}
