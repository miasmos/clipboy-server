import { HTTPError } from './httpError';

export class ForbiddenError extends HTTPError {
    constructor(message) {
        super(message, 403);
    }
}
