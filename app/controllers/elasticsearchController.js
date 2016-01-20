var elasticsearch = require('elasticsearch');
var logger = require('../utils/logger');

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
    logger.info("Sending %j search to elasticsearch", search_body, {});
    var search_config = {
        index: INDEX,
        type: TYPE,
        from: from || FROM_DEFAULT,
        size: size || SIZE_DEFAULT,
        body: search_body
    };
    this.client.search(search_config, function(err, res) {
        if (err) {
            logger.error("Error performing search", err);
            callback(err);
        }

        callback(null, res);
    })
};

module.exports = ElasticsearchController;
