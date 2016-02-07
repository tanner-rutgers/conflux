var express = require('express');
var morgan = require('morgan');
var logger = require("./utils/logger");
var bodyParser = require('body-parser')
var app = express();

// Configure logger
logger.info("Configuring morgan logger");
morgan.token('body', function(req) {
    return JSON.stringify(req.body);
});
app.use(morgan('[:date[web]] :method url: :url, content-type: :res[content-type], body: :body, status: :status, response-time: :response-time ms', {stream: logger.stream}));

// Basic configuration
app.use(bodyParser.json());

// Frontend page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});
app.use(express.static(__dirname + '/public'));

// API Routes setup
logger.info("Configuring routes");
var apiRouter = require('./routes/api');
app.use('/api', apiRouter);

// Error handling
app.use(logErrors);
app.use(errorHandler);

function logErrors(err, req, res, next) {
    logger.error("Application error: ", err);
    next(err);
}

function errorHandler(err, req, res, next) {
    res.status(500);
    res.json({ error: err });
}

module.exports = app;
