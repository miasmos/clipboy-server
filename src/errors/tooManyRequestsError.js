import { HTTPError } from './httpError';

export class TooManyRequestsError extends HTTPError {
    constructor(message) {
        super(message, 429);
    }
}
