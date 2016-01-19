import sys
import logging
import time
import os

from guidebox import guidebox_api


class GuideboxHelper:
    """Helper class for retrieving data from Guidebox API"""

    __DIR = os.path.dirname(os.path.abspath(__file__))
    __TIMESTAMP_FILENAME = os.path.join(__DIR, 'current_timestamp.txt')

    logger = logging.getLogger(__name__)

    def __init__(self):
        self.guidebox = guidebox_api.GuideboxAPI()

    def get_all_movies(self, max_count=None):
        """
        Retrieve all movies from Guidebox or 'max_count' movies
        :param max_count: Max number of movies to fetch (optional)
        :return: List of movie dicts
        """
        self.logger.info('GuideboxHelper get_all_movies (max_count=%d)')
        self.update_timestamp()
        index = 0
        all_movies = []
        while max_count is None or index < int(max_count):
            response = self.guidebox.get_movies(index, 250)
            movies = response['results']
            for result in movies:
                movie = self.get_movie(result['id'])
                all_movies.append(movie)
            total_returned = response['total_returned']
            total_results = response['total_results']
            index += total_returned
            if index > total_results:
                break
        return all_movies

    def get_movie(self, movie_id):
        """
        Retrieve the given movie from Guidebox containing only
        application relevant movie data
        :param movie_id: Guidebox ID of movie to retrieve
        :return: Dict describing movie
        """
        self.logger.info('GuideboxHelper get_movie: %d', movie_id)
        movie_data = self.guidebox.get_movie(movie_id)
        genres = [genre['title'] for genre in movie_data['genres']]
        writers = [writer['name'] for writer in movie_data['writers']]
        directors = [director['name'] for director in movie_data['directors']]
        cast = [{"name": cast['name'], "character": cast['character_name']} for cast in movie_data['cast']]
        sources = movie_data['free_web_sources'] + movie_data['subscription_web_sources']
        movie = {
            "id": movie_id,
            "title": movie_data['title'],
            "release_year": movie_data['release_year'],
            "imdb": movie_data['imdb'],
            "release_date": movie_data['release_date'],
            "rating": movie_data['rating'],
            "overview": movie_data['overview'],
            "poster_small": movie_data['poster_120x171'],
            "poster_medium": movie_data['poster_240x342'],
            "poster_large": movie_data['poster_400x570'],
            "genres": genres,
            "duration": movie_data['duration'],
            "writers": writers,
            "directors": directors,
            "cast": cast,
            "sources": sources
        }
        self.logger.info('Succesfully retrieved movie %d: %s', movie_id, movie['title'])
        return movie

    def get_all_updates(self):
        """
        Retrieves new and updated movies from Guidebox since latest update
        :return: List of updated/new movie dicts
        """
        self.logger.info('GuideboxHelper get_all_updates')
        latest_timestamp = self.get_latest_timestamp()
        self.update_timestamp()
        all_updates = self.get_new_movies(latest_timestamp)
        all_updates = all_updates + self.get_changed_movies(latest_timestamp)
        return all_updates

    def get_new_movies(self, since):
        """
        Retrieves new movies since 'since' timestamp
        :param since: UNIX timestamp of latest update from Guidebox
        :return: List of movie dicts
        """
        self.logger.info('GuideboxHelper get_new_movies (since: %s)', since)
        new_movies = []
        response = self.guidebox.get_new_movies(since)
        results = response['results']
        self.logger.info('%d new movies', len(results))
        for result in results:
            movie = self.get_movie(result['id'])
            new_movies.append(movie)
        return new_movies

    def get_changed_movies(self, since):
        """
        Retrieves updated movies since 'since' timestamp
        :param since: UNIX timestamp of latest update from Guidebox
        :return: List of movie dicts
        """
        self.logger.info('GuideboxHelper get_changed_movies (since: %s)', since)
        changed_movies = []
        response = self.guidebox.get_movie_changes(since)
        results = response['results']
        self.logger.info('%d updated movies', len(results))
        for result in results:
            movie = self.get_movie(result['id'])
            changed_movies.append(movie)
        return changed_movies

    def get_deleted_movies(self):
        """
        Retrieves list of IDs of deleted movies since latest update
        :return: List of movie IDs
        """
        self.logger.info('GuideboxHelper get_deleted_movies')
        deleted_movies = []
        latest_timestamp = self.get_latest_timestamp()
        response = self.guidebox.get_deleted_movies(latest_timestamp)
        results = response['results']
        self.logger.info('%d deleted movies', len(results))
        for result in results:
            deleted_movies.append(result['id'])
        return deleted_movies

    def get_latest_timestamp(self):
        """Retrieve the latest stored timestamp"""
        self.logger.info('GuideboxHelper get_latest_timestamp')
        if os.path.isfile(self.__TIMESTAMP_FILENAME):
            with open(self.__TIMESTAMP_FILENAME, 'r') as f:
                return f.readline().strip()
        else:
            self.logger.error('Timestamp file does not exist: %s', self.__TIMESTAMP_FILENAME)
            raise FileNotFoundError()

    def update_timestamp(self):
        """Retrieve and store the current UNIX timestamp from Guidebox"""
        self.logger.info('GuideboxHelper update_timestamp')
        timestamp = self.guidebox.get_timestamp()['results']
        with open(self.__TIMESTAMP_FILENAME, 'w') as f:
            self.logger.info('Writing timestamp (%d) to file (%s)', timestamp, f.name)
            print(timestamp, file=f)
