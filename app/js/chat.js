angular.module('gdgPackagedApp')
.controller('ChatController', function($scope, $rootScope, $timeout, MessageService) {
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
            // BUG: angular will not re-focus the element if focusName
            // was true on entry to sendMessage ... requires state
            // change to re-focus the element.
            // A hack would be to set to false, then use $timeout to
            // set back to true.
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

    MessageService.addListener(function(messages, peers) {
        // Need call $apply since this is an aysnc update to the scope.
        $scope.$apply(function () {
            $scope.udpServer = MessageService.udpServer;
            $scope.messages = messages;
            $scope.peers = peers;
            // After page update - scroll to bottom - better to force scroll to bottom
            // on update?
            $timeout(function() {
                chatDiv.scrollTop = chatDiv.scrollHeight;
            });
        });
    });
})
.controller('PeerDialog', function($scope, MessageService) {
    $('#peer-dialog').on('shown', function (e) {
        $('#peer-address').focus();
    });

    $scope.submit = function () {
        MessageService.addPeer({address: $scope.peerAddress, port: 9876});
        $('#peer-dialog').modal('hide');
    }
})
;
