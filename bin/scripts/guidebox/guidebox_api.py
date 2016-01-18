import requests
import logging


class GuideboxAPI:
    """Used to fetch data from the Guidebox API"""

    __INDEX_NAME = 'conflux'
    __TYPE_MOVIES = 'movies'
    __GUIDEBOX_HOST = 'https://api-public.guidebox.com'
    __GUIDEBOX_VER = 'v1.43'
    __GUIDEBOX_REGION_US = '__US'
    __GUIDEBOX_API_KEY = 'rKaLPYRwwXYRIwNHYtcEXTvbvlaicfra'
    __GUIDEBOX_BASE_PATH = '/'.join([__GUIDEBOX_HOST, __GUIDEBOX_VER, __GUIDEBOX_REGION_US, __GUIDEBOX_API_KEY])
    __GUIDEBOX_MOVIES_PATH = '/'.join([__GUIDEBOX_BASE_PATH, 'movies/all'])

    logger = logging.getLogger(__name__)

    def get_movies(self, start, size):
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

    def get_movie(self, id):
        url = '/'.join([self.__GUIDEBOX_MOVIE_PATH, str(id)])
        self.logger.info('GET %s', url)
        response = requests.get(url)
        if response.ok:
            movie_data = response.json()
            self.logger.info('Successfully retrieved movie %s: %s', movie_data['id'], movie_data['title'])
            return movie_data
        else:
            self.logger.error('Error retrieving movie %s', id)
            response.raise_for_status()
