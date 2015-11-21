var winston = require('winston');
var fs = require('fs');

var LOG_DIR = './logs';

// Create log dir if doesn't exist
if (!fs.existsSync(LOG_DIR) ) {
    fs.mkdirSync(LOG_DIR);
}

// Set up winston logger
winston.emitErrs = true;
var logger = new winston.Logger({
    transports: [
        new winston.transports.File({
            level: 'info',
            filename: LOG_DIR + '/app_log.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});

module.exports = logger;
module.exports.stream = {
    write: function(message){
        logger.info(message.slice(0, -1));
    }
};