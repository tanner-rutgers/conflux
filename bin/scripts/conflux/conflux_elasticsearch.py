import logging
import json
import os
from elasticsearch import Elasticsearch
from elasticsearch.client import IndicesClient


class ConfluxElasticsearch:
    """Wrapper around Conflux Elasticsearch instance"""

    __INDEX_NAME = 'conflux'
    __TYPE_MOVIES = 'movies'
    __DIR = os.path.dirname(os.path.abspath(__file__))
    __MAPPINGS_FILENAME = os.path.join(__DIR, 'mappings.json')

    logger = logging.getLogger(__name__)

    def __init__(self):
        self.es = Elasticsearch()

    def clear_index(self):
        """Deletes the conflux index"""
        if self.es.indices.exists(self.__INDEX_NAME):
            self.logger.info("deleting '%s' index...", self.__INDEX_NAME)
            res = self.es.indices.delete(index=self.__INDEX_NAME)
            self.logger.info("deletion result: %s", res)
        else:
            self.logger.info("index '%s' does not exist, skipping delete", self.__INDEX_NAME)

    def create_index(self):
        """Creates the conflux index and with necessary mappings"""
        with open(self.__MAPPINGS_FILENAME) as mapping_json:
            mapping = json.load(mapping_json)
        self.logger.info("creating index '%s' with: %s", self.__INDEX_NAME, mapping)
        res = self.es.indices.create(index=self.__INDEX_NAME, body=mapping)
        self.logger.info("index creation result: %s", res)
        indicesClient = IndicesClient(self.es)
        res = indicesClient.get_mapping(index=self.__INDEX_NAME)
        self.logger.info("index mappings: %s", res)

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
            res = self.es.bulk(index=self.__INDEX_NAME, body=bulk_request, refresh=True)
            self.logger.info('Bulk index of movies result: %s', res)

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
