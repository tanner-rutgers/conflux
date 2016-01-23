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
    var moviesController = new MoviesController();
    moviesController.searchAll(query, request.body, from, size, function(err, res) {
        if (err) {
            logger.error("Error calling movies.searchAll", err);
            return next(err);
        } else {
            response.status(200).send(res);
        }
    })
});

module.exports = router;