angular.module('Conflux').controller('SearchController', ['$scope', 'Movies', function($scope, Movies) {

    $scope.search = function() {

        var searchOptions = {
            query: $scope.queryTerm,
            from: 0,
            size: 10
        };

        Movies.getMovies(searchOptions)
            .success(function(data, statusCode) {
                console.log("search successful", statusCode, data);
                $scope.movies = data.movies;
            });
    }
}]);