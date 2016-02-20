angular.module('Conflux').controller('SearchController', ['$scope', 'Movies', function($scope, Movies) {

    $scope.genreSelect = {
        availableGenres: [],
        selectedGenres: [],
        extraSettings: {
            dynamicTitle: false
        },
        translationTexts: {
            buttonDefaultText: "Genres"
        }
    };

    Movies.getGenres().then(
        function success(data) {
            $scope.genreSelect.availableGenres = data.map(function(genre) {
                return { id: genre, label: genre };
            });
            $scope.genreSelect.selectedGenres = data.map(function(genre) {
                    return { id: genre };
            });
        }
    );

    $scope.castSelect = {
        availableCast: [],
        selectedCast: []
    };

    $scope.getCast = function(search_term) {
        if (search_term.length >= 3) {
            Movies.getActors(search_term).then(
                function success(data) {
                    $scope.castSelect.availableCast = data;
                }
            )
        }
    };

    $scope.search = function() {

        var searchOptions = {
            query: $scope.searchTerm,
            from: 0,
            size: 10
        };

        var filters = {};

        var selectedGenres = $scope.genreSelect.selectedGenres;
        var availableGenres = $scope.genreSelect.availableGenres;
        if (selectedGenres.length < availableGenres.length) {
            filters.genres = selectedGenres.map(function(genreObject) {
                return genreObject.id;
            })
        }

        var selectedCast = $scope.castSelect.selectedCast;
        if (selectedCast.length > 0) {
            filters["cast.name.raw"] = selectedCast;
        }

        Movies.getMovies(searchOptions, filters).then(
            function success(data) {
                $scope.movies = data.movies;
            }
        );
    };



}]);