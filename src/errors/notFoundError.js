import { HTTPError } from './httpError';

export class NotFoundError extends HTTPError {
    constructor(message) {
        super(message, 404);
    }
}
