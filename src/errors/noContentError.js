import { HTTPError } from './httpError';

export class NoContentError extends HTTPError {
    constructor(message) {
        super(message, 204);
    }
}
