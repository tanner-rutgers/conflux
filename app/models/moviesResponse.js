/**
 * Model containing a list of movies
 * @param movies List of movies
 * @constructor
 */
function MoviesResponse(movies, total, from) {
    this.movies = movies || [];
    this.total = total || 0;
    this.from = from || 0;
    this.returned = movies.length;
}

module.exports = MoviesResponse;