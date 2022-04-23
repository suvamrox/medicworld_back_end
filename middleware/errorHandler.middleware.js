
var { errorLogger } = require('../config/winston.config');

/**
 * Catches and processes errors that occur both synchronously and asynchronously.
 * @param {*} err Error object
 * @param {*} req Request object
 * @param {*} res Response object
 * @param {*} next Callback
 */

// eslint-disable-next-line no-unused-vars
exports.errorHandler = (err, req, res, next) => {
    console.log("Default Error handler")
    console.log(err);
    // console.error(err);
    //log error details with api endpoint and ip
    errorLogger.error({
        endpoint: `${req.method}  ${req.protocol}://${req.get('host')}${req.originalUrl}`,
        ip: req.ip,
        error: err
    });

    res.status(err.statusCode || 500).send({
        message: err.message || 'something is went wrong in our side. please try again.'
    });
}
