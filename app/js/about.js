angular.module('gdgPackagedApp')
.controller({
    AboutController: function($scope) {
        console.log("AboutController");
        namespace.gdg.network.init(function () {
            $scope.adaptors = namespace.gdg.network.getAdaptors();
        });
    }
});
