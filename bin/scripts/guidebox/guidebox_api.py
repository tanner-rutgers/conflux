import requests
import logging


class GuideboxAPI:
    """Used to fetch data from the Guidebox API"""

    __INDEX_NAME = 'conflux'
    __TYPE_MOVIES = 'movies'
    __GUIDEBOX_HOST = 'https://api-public.guidebox.com'
    __GUIDEBOX_VER = 'v1.43'
    __GUIDEBOX_REGION_US = 'US'
    __GUIDEBOX_API_KEY = 'rKaLPYRwwXYRIwNHYtcEXTvbvlaicfra'
    __GUIDEBOX_BASE_PATH = '/'.join([__GUIDEBOX_HOST, __GUIDEBOX_VER, __GUIDEBOX_REGION_US, __GUIDEBOX_API_KEY])
    __GUIDEBOX_MOVIES_PATH = '/'.join([__GUIDEBOX_BASE_PATH, 'movies/all'])
    __GUIDEBOX_MOVIE_PATH = '/'.join([__GUIDEBOX_BASE_PATH, 'movie'])
    __GUIDEBOX_UPDATES_PATH = '/'.join([__GUIDEBOX_BASE_PATH, 'updates'])
    __GUIDEBOX_TIME_PATH = '/'.join([__GUIDEBOX_UPDATES_PATH, 'get_current_time'])

    logger = logging.getLogger(__name__)

    def get_timestamp(self):
        """Retrieve the current UNIX timestamp from Guidebox"""
        self.logger.info('Guidebox get_timestamp')
        self.logger.info('GET %s', self.__GUIDEBOX_TIME_PATH)
        response = requests.get(self.__GUIDEBOX_TIME_PATH)
        if response.ok:
            return response.json()
        else:
            self.logger.error('Error retrieving timestamp')
            response.raise_for_status()

    def get_movies(self, start, size):
        """
        Retrieve most popular movies from Guidebox
        :param start: Starting index of movies to retrieve
        :param size: Number of movies to retrieve, starting at 'start'
        :return: Guidebox movies API response in JSON dict
        """
        self.logger.info('Guidebox get_movies %d-%d (%d movies)', start, start + size, size)
        url = '/'.join([self.__GUIDEBOX_MOVIES_PATH, str(start), str(size)])
        self.logger.info("GET %s", url)
        response = requests.get(url)
        if response.ok:
            movies = response.json()
            self.logger.info('Successfully retrieved %d movies', movies['total_returned'])
            return movies
        else:
            self.logger.error('Guidebox movies call failure: %s', response)
            response.raise_for_status()

    def get_movie(self, movie_id):
        """
        Retrieve movie with given id
        :param movie_id: ID of movie to retrieve
        :return: Guidebox movie API response in JSON dict
        """
        self.logger.info('Guidebox get_movie: %d', movie_id)
        url = '/'.join([self.__GUIDEBOX_MOVIE_PATH, str(movie_id)])
        self.logger.info('GET %s', url)
        response = requests.get(url)
        if response.ok:
            movie_data = response.json()
            self.logger.info('Successfully retrieved movie %s: %s', movie_data['id'], movie_data['title'])
            return movie_data
        else:
            self.logger.error('Error retrieving movie %s', movie_id)
            response.raise_for_status()
