var logger = require('../utils/logger');
var ElasticsearchController = require('./elasticsearchController');
var MoviesResponse = require('../models/moviesResponse');

/**
 * Controller for performing various movies queries
 * @constructor
 */
function MoviesController() {
    this.elasticsearchController = new ElasticsearchController();
}

/**
 * Search all fields (title, overview, cast, writers, directors) for the given query string,
 * with optional additional filters
 * @param query Query string to search for
 * @param filterBody Object containing properties for each filter
 * @param callback Typical callback(err, res) - res will contain a MoviesResponse object with search results
 */
MoviesController.prototype.searchAll = function(queryString, filterBody, from, size, callback) {
    logger.info("Movies.searchAll query=%s, filters=%j, from: %d, size: %d", queryString, filterBody, from, size, {});
    var query = queryString ? {
        multi_match: {
            query: queryString,
            fields: ["title^8", "overview^4", "cast^2", "writers", "directors"],
            type: "phrase"
        }
    } : {
        match_all: {}
    };
    var search_filters = getFilters(filterBody);
    var search_body = {
        query: {
            filtered: {
                filter: {
                    bool: {
                        must: search_filters
                    }
                },
                query: query
            }
        }
    };
    logger.info("Searching with %s, from %d, size %d", search_body, from, size);
    this.elasticsearchController.search(search_body, from, size, function(err, res) {
        if (err) {
            logger.error("Error performing search", err);
            return callback(err);
        }

        var results = res.hits.hits.map(function(hit) {
            return hit._source;
        });
        var resultsTotal = res.hits.total;
        var resultsReturned = results.length;
        logger.info("Movies.searchAll success - found %d - returning %d from %d", resultsTotal, resultsReturned, from);
        var moviesResponse = new MoviesResponse(results, resultsTotal, from);
        callback(null, moviesResponse);
    })
};

/**
 * Retrieve a single random movie that conforms to the given optional filters
 * @param filterBody Object containing properties for each filter (ex// { "sources.source": "hulu_plus" })
 * @param callback Typicall callback(err, res) - res will contain a MovieResponse object with single movie
 */
MoviesController.prototype.getRandom = function(filterBody, callback) {
    logger.info("Movies.getRandom filter=%j", filterBody, {});
    var search_filters = getFilters(filterBody);
    var search_body = {
        query: {
            function_score: {
                filter: {
                    bool: {
                        must: search_filters
                    }
                },
                functions: [
                    {
                        random_score: {}
                    }
                ],
                score_mode: "sum"
            }
        }
    };
    this.elasticsearchController.search(search_body, 0, 1, function(err, res) {
        if (err) {
            logger.error("Error performing search", err);
            return callback(err);
        }

        var results = res.hits.hits.map(function(hit) {
            return hit._source;
        });
        logger.info("Movies.getRandom success - returned %s", results);
        var moviesResponse = new MoviesResponse(results, null, null);
        callback(null, moviesResponse);
    })
};

/**
 * Retrieve a single movie with the given id
 * @param movie_id Id of movie to retrieve
 * @param callback Typical callback(err, res) - res will contain a single movie object or null if not found
 */
MoviesController.prototype.getMovie = function(movie_id, callback) {
    logger.info("Movies.getMovie movie_id=%s", movie_id, {});
    this.elasticsearchController.getMovie(movie_id, function(err, res) {
        if (err) {
            logger.error("Error getting movie", err);
            return callback(err);
        }

        var movie = res._source;
        logger.info("Movies.getMovie success - returned %s", res);
        callback(null, movie);
    })
};

/**
 * Retrieve filters
 * @param request
 * @returns {Array}
 */
function getFilters(filterBody) {
    var filters = [];
    for (var propName in filterBody) {
        if (filterBody.hasOwnProperty(propName)) {
            var filter = {};
            filter[propName] = filterBody[propName];
            var terms = { terms: filter };
            filters.push(terms);
        }
    }
    return filters;
}

module.exports = MoviesController;
