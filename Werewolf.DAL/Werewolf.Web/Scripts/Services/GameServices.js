angular.module('werewolf').factory("GameService", [
	"$http", function ($http) {
	    return {
	        CreateGame: function (gameName, username, successResultCallback, errorResultCallback) {
	            return $http.get("/Home/CreateGame?gameName=" + gameName + "&username=" + username).success(function (response) {
	                successResultCallback(response);
	            }).error(function () {
	                errorResultCallback(null);
	            });
	        },
	        JoinGame: function (gameName, username, successResultCallback, errorResultCallback) {
	            return $http.get("/Home/JoinGame?gameName=" + gameName + "&username=" + username).success(function (response) {
	                successResultCallback(response);
	            }).error(function () {
	                errorResultCallback(null);
	            });
	        }
	    };
	}
]);
