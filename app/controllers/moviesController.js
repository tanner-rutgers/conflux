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
 * @param filterBody Object containing single property for each filter
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
            logger.error("Error performing searchAll", err);
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
