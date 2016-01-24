var express = require('express');
var router = express.Router();
var logger = require("../utils/logger");
var MoviesController = require('../controllers/moviesController');

var controller = new MoviesController();

/**
 * Movies search API
 */
router.post('/movies/search', function (request, response, next) {
    var query = request.query.query;
    var from = request.query.from;
    var size = request.query.size;
    var random = request.query.random == true;
    if (random) {
        controller.searchAll(query, request.body, from, size, function (err, res) {
            if (err) {
                logger.error("Error calling movies.searchAll", err);
                return next(err);
            } else {
                response.status(200).send(res);
            }
        })
    } else {
        controller.getRandom(request.body, function (err, res) {
            if (err) {
                logger.error("Error calling movies.getRandom", err);
                return next(err);
            } else {
                response.status(200).send(res);
            }
        })
    }
});

router.get('/movies/:id', function (request, response, next) {
    var movie_id = request.params.id;
    controller.getMovie(movie_id, function (err, res) {
        if (err) {
            if (err.status == 404) {
                logger.warn("movies.getMovie returned no result");
                return response.status(404).send(err);
            } else {
                logger.error("Error calling movies.getMovie", err);
                return next(err);
            }
        } else {
            response.status(200).send(res);
        }
    })
});

module.exports = router;