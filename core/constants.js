const httpStatusCodes = {
    HTTP_SUCCESS: 200,
    UNAUTHORIZED: 401,
    INTERNAL_SERVER: 500,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CREATED: 201,
    FORBIDDEN: 403,
    UNPROCESSABLE: 422,
    LOCKED: 423,
    SERVICE_UNAVAILABLE: 503,
    CONFLICT: 409
}

const errorMessage = {
    USER_NOT_FOUND: 'User does not exist',
    NOT_FOUND: 'The Information you looking for does not exist',
    INVALID_CREDENTIAL: 'Please check the email or password you have entered',
    LOGIN_SUCCESS: 'You have logged in successfully',
    UNAUTHORIZED_ACCESS_TOKEN: 'Invalid access token ',
    CONFLICT: 'The value you entered is already in the DB',
    BAD_REQUEST: 'Bad request. The request could not be understood by the server.',
    MISSING_FIELD: 'Some Field is missing.',
    MAX_LIMIT: 'Value must me less then or equal max value.',
    MIN_LIMIT: 'Value must me greater then or equal min value.',
    MAX_LENGTH: 'Value must me less then or equal maxlength value.',
    MIN_LENGTH: 'Value must me greater then or equal minlength value.',
    PATTERN: 'Pattern don not match',
    BOOLEAN: 'Value should be boolean.',
    REQUIRED: 'Field is required.'
}

const statusMessage = {
    INSERT_SUCCESS: 'Resource inserted successfully',
    DELETE_SUCCESS: 'Resource deleted successfully',
    UPDATE_SUCCESS: 'Resource updated successfully'
}

const filePath = {
    product_image_url: '/static/images/product',
    product_image_hdd_path: 'public/images/product'
}

module.exports = {
    httpStatusCodes,
    errorMessage,
    statusMessage,
    filePath
}