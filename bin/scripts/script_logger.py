import logging

__author__ = 'Tanner Rutgers'

import os
import json
import logging.config

__DEFAULT_CFG_PATH = 'script_logger_config.json'
__DEFAULT_LOG_LEVEL = logging.INFO
__ENV_KEY = 'LOG_CFG'


def setup_logging(path=__DEFAULT_CFG_PATH, level=__DEFAULT_LOG_LEVEL, env_key=__ENV_KEY):
    """Setup logging configuration"""

    value = os.getenv(env_key, None)
    if value:
        path = value
    if os.path.exists(path):
        print('Using supplied logging config')
        with open(path, 'rt') as f:
            config = json.load(f)
        logging.config.dictConfig(config)
    else:
        print('Using basic logging config')
        logging.basicConfig(level=level)
