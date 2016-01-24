var express = require('express');
var router = express.Router();
var logger = require("../utils/logger");
var MoviesController = require('../controllers/moviesController');

/**
 * Movies search API
 */
router.post('/movies/search', function (request, response, next) {
    var query = request.query.query;
    var from = request.query.from;
    var size = request.query.size;
    var random = request.query.random == true;
    var moviesController = new MoviesController();
    if (random) {
        moviesController.searchAll(query, request.body, from, size, function (err, res) {
            if (err) {
                logger.error("Error calling movies.searchAll", err);
                return next(err);
            } else {
                response.status(200).send(res);
            }
        })
    } else {
        moviesController.getRandom(request.body, function (err, res) {
            if (err) {
                logger.error("Error calling movies.getRandom", err);
                return next(err);
            } else {
                response.status(200).send(res);
            }
        })
    }
});

module.exports = router;