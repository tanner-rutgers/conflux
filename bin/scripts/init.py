#!/usr/bin/env python3

import logging
import time
import sys

from conflux import conflux_elasticsearch
from guidebox import guidebox_api
import script_logger

logger = logging.getLogger(__name__)
db = conflux_elasticsearch.ConfluxElasticsearch()
guidebox = guidebox_api.Guidebox()


def main():
    """Clears and repopulates Elasticsearch instance with all movies from Guidebox"""
    print('WARNING: This will delete entire Conflux index and repopulate.')
    proceed = input("Are you sure you want to proceed? (y/n): ")
    if proceed.lower() == 'y':
        db.clear_index()
        populate_all_movies(5000)
    else:
        print('Wise decision, carry on.')


def populate_all_movies(max_count=None):
    """
    Populate Elasticsearch instance with movies from Guidebox
    :param max_count: Max number of movies to fetch
    :return: None
    """
    max_count = sys.maxint if max_count is None else max_count
    logger.info('Populating %d movies from Guidebox', max_count)
    index = 0
    while index < max_count:
        movies = guidebox.get_movies(index, 250)
        populate_movies(movies)
        total_returned = movies['total_returned']
        if total_returned < 250:
            break
        index += total_returned
        time.sleep(1)


def populate_movies(guidebox_response):
    """
    Given Guidebox API response, populate Elasticsearch instance with results
    :param guidebox_response: JSON response from Guidebox API movies call
    :return: None
    """
    all_movies = guidebox_response['results']
    movies_data = []
    for movie in all_movies:
        id = movie['id']
        movie_data = guidebox.get_movie(id)
        movies_data.append(movie_data)
    db.bulk_index_movies(movies_data)


if __name__ == "__main__":
    script_logger.setup_logging()
    main()
