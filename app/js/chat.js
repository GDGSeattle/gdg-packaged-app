angular.module('gdgPackagedApp')
.controller({
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
    }
});
