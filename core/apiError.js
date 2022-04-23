const { httpStatusCodes } = require('./constants')
const BaseError = require('./baseError')

/**
 *Create Custom errors using this class.
 * @class ApiError
 * @extends {BaseError}
 */
class ApiError extends BaseError {
    /**
     * Creates an instance of ApiError.
     * @param {number} statusCode Http status code.
     * @param {string} message Error message.
     * @param {boolean} isOperational Boolean.
     * @memberof ApiError
     */
    constructor(
        /* istanbul ignore next */
        statusCode = httpStatusCodes.NOT_FOUND,
        /* istanbul ignore next */
        message = 'Not found.',
        isOperational = true,
    ) {
        super(statusCode, isOperational, message)
    }
}

module.exports = ApiError