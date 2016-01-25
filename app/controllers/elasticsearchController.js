var elasticsearch = require('elasticsearch');
var logger = require('../utils/logger');
var VError = require('verror');

var HOST = 'localhost:9200';
var INDEX = 'conflux';
var TYPE = 'movies';
var FROM_DEFAULT = 0;
var SIZE_DEFAULT = 10;

/**
 * Controller for interacting with elasticsearch instance
 * @constructor
 */
function ElasticsearchController() {
    this.client = new elasticsearch.Client({
        host: HOST
    })
}

/**
 * Search elasticsearch instance with the given search body (in Query DSL)
 * @param search_body Search body to use (in Query DSL)
 * @param callback Typical callback function(err, res) - res will contain the unmodified elasticsearch response
 */
ElasticsearchController.prototype.search = function(search_body, from, size, callback) {
    var search_body = {
        index: INDEX,
        type: TYPE,
        from: from || FROM_DEFAULT,
        size: size || SIZE_DEFAULT,
        body: search_body
    };
    logger.info("Sending %j search to elasticsearch", search_body, {});
    this.client.search(search_body, function(err, res) {
        if (err) {
            return callback(new VError(err, "elasticsearch client.search(%j) failed", search_body));
        }

        callback(null, res);
    })
};

/**
 * Retrieve a single movie with the given id
 * @param movie_id ID of movie to retrieve
 * @param callback Typical callback function(err, res) - res will contain the unmodified elasticsearch response
 */
ElasticsearchController.prototype.getMovie = function(movie_id, callback) {
    var search_body = {
        index: INDEX,
        type: TYPE,
        id: movie_id
    };
    logger.info("Sending %j request to elasticsearch", search_body, {});
    this.client.get(search_body, function(err, res) {
        if (err) {
            return callback(new VError(err, "elasticsearch client.get(%j) failed", search_body));
        }

        callback(null, res);
    })
};

module.exports = ElasticsearchController;
