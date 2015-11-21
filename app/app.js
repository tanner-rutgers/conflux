var express = require('express');
var morgan = require('morgan');
var logger = require("./utils/logger");

var app = express();

// Configure logger
logger.info("Configuring morgan logger");
morgan.token('body', function(req) {
    return JSON.stringify(req.body);
});
app.use(morgan('[:date[web]] :method url: :url, content-type: :res[content-type], body: :body, status: :status, response-time: :response-time ms', {stream: logger.stream}));

// Routes setup
logger.info("Configuring routes");
var apiRouter = require('./routes/api')(express);
app.use('/api', apiRouter);

module.exports = app;
