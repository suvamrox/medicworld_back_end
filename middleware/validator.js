const { body, validationResult } = require('express-validator');
var { errorLogger } = require('../config/winston.config');
const { errorMessage, httpStatusCodes } = require('../core/constants');



const userValidationRules = () => {
    return [
        // username must be an email
        body('name').exists().withMessage(errorMessage.REQUIRED).trim().escape(),
        body('setting').exists().withMessage(errorMessage.REQUIRED),
        body('status').exists().withMessage(errorMessage.REQUIRED).isBoolean().withMessage(errorMessage.BOOLEAN)
    ]
}

const validate = (req, res, next) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
        return next()
    }
    const extractedErrors = []
    errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }))

    errorLogger.error({
        endpoint: `${req.method}  ${req.protocol}://${req.get('host')}${req.originalUrl}`,
        ip: req.ip,
        error: extractedErrors
    });

    return res.status(httpStatusCodes.UNPROCESSABLE).json({
        errors: extractedErrors,
    })
}

module.exports = {
    userValidationRules,
    validate,
}