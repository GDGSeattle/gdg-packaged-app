angular.module('gdgPackagedApp', [])
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
    .service({
        MessageService: function() {
            this.messages = [];

            this.listeners = [];
            this.onChange = function(listener) {
                this.listeners.push(listener);
                listener(this.messages);
            };

            this.updateListeners = function() {
                for (var i = 0; i < this.listeners.length; i++) {
                    this.listeners[i](this.messages);
                }
            }

            this.addMessage = function (message) {
                this.messages.push(message);
                this.updateListeners();
            };
        }
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
        },

        ChatController: function($scope, $rootScope, MessageService) {
            $scope.$watch('userName', function() {
                $rootScope.userName = $scope.userName;
            });

            $scope.sendMessage = function () {
                $scope.showError('');
                if (!$scope.userName) {
                    $scope.showError("Please enter a user name.");
                    $('#user-name').focus();
                    return;
                }
                if (!$scope.messageText) {
                    $scope.showError("Empty message.");
                    return;
                }
                MessageService.addMessage({from: $rootScope.userName,
                                           text: $scope.messageText});
                $scope.messageText = "";
            }

            MessageService.onChange(function(messages) {
                $scope.messages = messages;
            });
        },

        AboutController: function($scope) {
        }

        });
