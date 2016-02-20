angular.module('Conflux').factory('Movies', function Movies ($http) {
    var exports = {};

    serialize = function(obj) {
        var str = [];
        for(var p in obj)
            if (obj.hasOwnProperty(p) && obj[p]) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    };

    exports.getMovies = function (searchParams, filters) {
        var url = '/api/movies/search';
        if (searchParams) {
            url += '?' + serialize(searchParams);
        }

        return $http.post(url, filters).then(
            function success(response) {
                console.log("getMovies success", response.status, response.data);
                return response.data;
            }, function error(response) {
                console.error("getMovies error", response.status, response.data);
            }
        );
    };

    exports.getGenres = function() {
        return $http.get('/api/genres').then(
            function success(response) {
                console.log("getGenres success", response.status, response.data);
                return response.data;
            }, function error(response) {
                console.error("getGenres error", response.status, response.data);
            }
        );
    };

    exports.getActors = function(search_term) {
        return $http.get('/api/cast?search=' + search_term).then(
            function success(response) {
                console.log("getActors success", response.status, response.data);
                return response.data;
            }, function error(response) {
                console.error("getActors error", response.status, response.data);
            }
        );
    };

    return exports;
});