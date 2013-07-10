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
        },

        ChatController: function($scope, $rootScope, $timeout, MessageService) {
            $scope.$watch('userName', function() {
                $rootScope.userName = $scope.userName;
            });

            // Set the input focus appropriately when the view is created.
            if (!$scope.userName) {
                $scope.focusName = true;
            } else {
                $scope.focusMessage = true;
            }

            // TODO: not angular-idiomatic - should use a directive?
            var chatDiv = $('div.chat')[0];

            $scope.sendMessage = function () {
                $scope.showError('');
                if (!$scope.userName) {
                    $scope.showError("Please enter a user name.");
                    $scope.focusName = true;
                    return;
                }
                $scope.focusName = false;

                if (!$scope.messageText) {
                    $scope.showError("Empty message.");
                    return;
                }

                MessageService.addMessage({from: $scope.userName,
                                           text: $scope.messageText});
                $scope.messageText = "";
            }

            MessageService.addListener(function(messages) {
                // Need call $apply since this is an aysnc update to the scope.
                $scope.$apply(function () {
                    $scope.udpServer = MessageService.udpServer;
                    if (!messages) {
                        return;
                    }
                    $scope.messages = messages;
                    // After page update - scroll to bottom - better to force scroll to bottom
                    // on update?
                    $timeout(function() {
                        chatDiv.scrollTop = chatDiv.scrollHeight;
                    });
                });
            });
        },

        AboutController: function($scope) {
            console.log("AboutController");
            namespace.gdg.network.init(function () {
                $scope.adaptors = namespace.gdg.network.getAdaptors();
            });
        }

        });
