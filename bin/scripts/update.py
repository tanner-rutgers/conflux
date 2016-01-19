#!/usr/bin/env python3

import logging

from conflux import conflux_elasticsearch
from guidebox import guidebox_helper
import script_logger

logger = logging.getLogger(__name__)


def main():
    logger.info('update.py performing all updates')
    perform_all_updates()


def perform_all_updates():
    db = conflux_elasticsearch.ConfluxElasticsearch()
    guidebox = guidebox_helper.GuideboxHelper()
    perform_updates(db, guidebox)
    perform_deletes(db, guidebox)


def perform_updates(db, guidebox):
    logger.info('update.py perform_updates')
    changed_movies = guidebox.get_all_updates()
    db.bulk_index_movies(changed_movies)


def perform_deletes(db, guidebox):
    logger.info('update.py perform_deletes')
    deleted_movies = guidebox.get_deleted_movies()
    db.delete_movies(deleted_movies)

if __name__ == "__main__":
    script_logger.setup_logging()
    main()
