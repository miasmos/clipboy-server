export class HTTPError extends Error {
    constructor(message = 'An error occurred', status = 500) {
        super(message);
        this.status = status;
    }
}
