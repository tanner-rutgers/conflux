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

        return $http.post(url)
            .error(function (data) {
                console.log('There was an error!', data);
            });
    };

    return exports;
});