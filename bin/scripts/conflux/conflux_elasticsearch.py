import logging
from elasticsearch import Elasticsearch


class ConfluxElasticsearch:
    """Wrapper around Conflux Elasticsearch instance"""

    __INDEX_NAME = 'conflux'
    __TYPE_MOVIES = 'movies'

    logger = logging.getLogger(__name__)

    def __init__(self):
        self.es = Elasticsearch()

    def clear_index(self):
        """Deletes the elasticsearch index"""
        if self.es.indices.exists(self.__INDEX_NAME):
            self.logger.info("deleting '%s' index...", self.__INDEX_NAME)
            res = self.es.indices.delete(index=self.__INDEX_NAME)
            self.logger.info("deletion response: %s", res)

    def bulk_index_movies(self, movies):
        """
        Performs a bulk index with the given movies, using the
        id field of each movie as __id
        :param movies: List of movies dicts to index
        :return: None
        """
        self.logger.info('ConfluxElasticsearch bulk_index_movies (%d movies)', len(movies))
        bulk_request = []
        for movie in movies:
            operation = {
                "index": {
                    "_index": self.__INDEX_NAME,
                    "_type": self.__TYPE_MOVIES,
                    "_id": movie['id']
                }
            }
            bulk_request.append(operation)
            bulk_request.append(movie)
        if len(bulk_request) > 0:
            self.es.bulk(index=self.__INDEX_NAME, body=bulk_request, refresh=True)

    def delete_movies(self, movie_ids):
        """
        Removes all movies with the given 'movie_ids' from elasticsearch index
        :return: None
        """
        self.logger.info('ConfluxElasticsearch delete_movies (%d movies)', len(movie_ids))
        bulk_request = []
        for movie_id in movie_ids:
            operation = {
                "delete": {
                    "_id": movie_id
                }
            }
            bulk_request.append(operation)
        if len(bulk_request) > 0:
            self.es.bulk(index=self.__INDEX_NAME, body=bulk_request, refresh=True)
