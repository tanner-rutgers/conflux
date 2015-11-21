var express = require('express');
var morgan = require('morgan');
var logger = require("./utils/logger");

var app = express();

// Configuration
app.use(morgan('common', {stream: logger.stream}));

module.exports = app;
