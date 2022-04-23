class BaseError extends Error {
    constructor(statusCode, isOperational, message) {
        super(message);// 'Error' breaks prototype chain here

        Object.setPrototypeOf(this, new.target.prototype);// restore prototype chain
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this);
    }
}

module.exports = BaseError