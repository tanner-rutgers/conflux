var express = require('express');
var router = express.Router();
var logger = require('../utils/logger');
var utils = require('../utils/utils');
var VError = require('verror');
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
    if (!random) {
        controller.searchAll(query, request.body, from, size, function (err, res) {
            if (err) {
                return next(new VError(err, "MoviesController.searchAll(%s, %s, %d, %d) failed", query, request.body, from, size));
            } else {
                response.status(200).send(res);
            }
        })
    } else {
        controller.getRandom(request.body, function (err, res) {
            if (err) {
                return next(new VError(err, "MoviesController.getRandom(%s) failed", request.body));
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
            var root = utils.getVErrorRoot(err);
            if (root.status == 404) {
                return response.status(404).send(root);
            } else {
                return next(new VError(err, "MoviesController.getMovie(%d) failed", movie_id));
            }
        } else {
            response.status(200).send(res);
        }
    })
});

module.exports = router;