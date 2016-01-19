#!/usr/bin/env python3

import argparse

from conflux import conflux_elasticsearch
from guidebox import guidebox_helper
import script_logger

__SCRIPT_DESCRIPTION = 'Script to freshly populate all movies from Guidebox'


def main(args):
    print('WARNING: This will delete entire Conflux index and repopulate.')
    proceed = input("Are you sure you want to proceed? (y/n): ")
    if proceed.lower() == 'y':
        populate_all_movies(args.max)
    else:
        print('Wise decision, carry on.')


def populate_all_movies(max_movies):
    db = conflux_elasticsearch.ConfluxElasticsearch()
    db.clear_index()
    guidebox = guidebox_helper.GuideboxHelper()
    movies = guidebox.get_all_movies(max_movies)
    db.bulk_index_movies(movies)


def setup_args():
    parser = argparse.ArgumentParser(description=__SCRIPT_DESCRIPTION)
    parser.add_argument('-m', '--max', help='Max number of movies to retrieve', required=False)
    return parser.parse_args()


if __name__ == "__main__":
    script_logger.setup_logging()
    args = setup_args()
    main(args)
