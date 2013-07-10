angular.module('gdgPackagedApp', ['gdgMessages'])
    .config(function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/chat.html',
                controller: 'ChatController'
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
        NavController: function ($scope, $location) {
            $scope.appName = "GDG Austin Dev Fest";
            $scope.errorMessage = '';

            $scope.nav = function(path) {
                $location.path(path);
            }

            $scope.navClass = function(path) {
                if (path[0] != '/') {
                    path = '/' + path;
                }
                return $location.path() == path ? 'active' : '';
            }

            $scope.newWindow = function() {
                var bounds = chrome.app.window.current().getBounds();
                var newBounds =  {
                    left: (bounds.left + 50) % (screen.width - bounds.width),
                    // Need some slop or chrome positions window higher than desired (Mac only)?
                    top: (bounds.top + 50) % (screen.height - bounds.height - 80),
                    width: bounds.width,
                    height: bounds.height
                };
                chrome.app.window.create('index.html', {bounds: newBounds});
            }

            $scope.showError = function (message) {
                $scope.errorMessage = message;
            };
        }
    });
