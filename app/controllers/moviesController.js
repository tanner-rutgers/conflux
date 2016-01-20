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
 * @param filters Array of { field: [values] } objects to filter
 * @param callback Typical callback(err, res) - res will contain a MoviesResponse object with search results
 */
MoviesController.prototype.searchAll = function(queryString, filters, from, size, callback) {
    logger.info("Movies.searchAll query=%s, filters=%j, from: %d, size: %d", queryString, filters, from, size, {});
    var query = queryString ? {
        multi_match: {
            query: queryString,
            fields: ["title^4", "overview^2", "cast", "writers", "directors"]
        }
    } : {
        match_all: {}
    };
    var search_filters = filters ? filters.map(function(filter) {
        return { terms: filter };
    }) : [];
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
    this.elasticsearchController.search(search_body, from, size, function(err, res) {
        if (err) {
            logger.error("Error performing searchAll", err);
            callback(err);
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

module.exports = MoviesController;
