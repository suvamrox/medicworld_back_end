var appRoot = require('app-root-path');
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, errors, prettyPrint } = format;
require('winston-daily-rotate-file');

// define the custom settings for each transport (file, console)
var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/` + 'application-%DATE%.log',
        datePattern: 'YYYY-MM-DD-HH',
        zippedArchive: true,
        handleExceptions: true,
        json: true,
        maxSize: '20m',
        maxFiles: '14d'
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

// instantiate a new Winston Logger with the settings defined above
var apiLogger = createLogger({
    format: combine(
        timestamp(),
        errors({ stack: true }),
        prettyPrint()
    ),
    transports: [
        new transports.DailyRotateFile(options.file),
        new transports.Console(options.console)
    ],
    exitOnError: false, // do not exit on handled exceptions
});

var errorLogger = createLogger({
    format: combine(
        timestamp(),
        errors({ stack: true }),
        prettyPrint()
    ),
    transports: [
        new transports.DailyRotateFile({
            level: 'info',
            filename: `${appRoot}/logs/` + 'error-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            handleExceptions: true,
            json: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
    exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
apiLogger.stream = {
    write: function (message) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        apiLogger.info(message);
    },
};

module.exports = {
    apiLogger,
    errorLogger
};