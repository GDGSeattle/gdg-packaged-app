angular.module('gdgPackagedApp', [])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/home.html',
                controller: 'HomeController'
            })
            .when('/about', {
                templateUrl: 'views/about.html',
                controller: 'AboutController'
            })
            .otherwise({
                redirectTo: '/'
            });
    })
    .controller({
        "NavController": function ($scope, $location) {
            $scope.appName = "GDG Austin Dev Fest";

            $scope.nav = function(path) {
                $location.path(path);
            }

            $scope.navClass = function(path) {
                if (path[0] != '/') {
                    path = '/' + path;
                }
                return $location.path() == path ? 'active' : '';
            }
        },

        "HomeController": function($scope) {
        },

        "AboutController": function($scope) {
        }

        });
