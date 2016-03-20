var app = angular.module("werewolf").controller("HomeController",
	["$scope", "PreloadService", "GameService",
		function ($scope, preloadService, gameService) {
		    $scope.game = angular.copy(preloadService.GetPreloadedData("Game"));
		    $scope.players = $scope.game.Players;
		    $scope.username = "";
		    $scope.playerRole;
		    $scope.burnCards = 0;
		    $scope.isDay = false;
		    $scope.isFortuneTeller = false;
		    $scope.isHunter = false;
		    $scope.isWerewolves = false;
		    $scope.isWitch = false;
		    $scope.role = "";
		    $scope.haveJoinedGame = false;
		    $scope.othersInSameRole = [];
		    $scope.showRelatedPlayers = $scope.othersInSameRole.length > 0;

		    
		    //Witch Actions
		    $scope.witchSaved = false;
		    $scope.witchKilling = "";

		    $scope.witchSave = function () {
		        $scope.witchSaved = true;
		    };

		    $scope.witchKill = function (username) {
		        $scope.witchKilling = username;
		    }

		    //Fortune Teller Actions
		    $scope.hasSeenPlayer = false;
		    $scope.selectedPlayer = {};

		    //Werewolves actions
		    $scope.playerKilled = "";


		    $scope.isPlayerWerewolf = function () {
		        return $scope.role === "Werewolf";
		    };

		    $scope.isPlayerHunter = function () {
		        return $scope.role === "Hunter";
		    };

		    $scope.isPlayerWitch = function () {
		        return $scope.role === "Witch";
		    };

		    $scope.isPlayerFortuneTeller = function () {
		        return $scope.role === "Fortune Teller";
		    };

		    $scope.showPlayer = function (username) {
		        $scope.hasSeenPlayer = true;
		        $scope.selectedPlayer = $scope.game.Players.filter(function (obj) {
		            return obj.username == username;
		        });
		    };

		    $scope.getRoleNameFor = function (role) {
		        if (role == 1) {
		            return "Fortune Teller";
		        } else if (role == 2) {
		            return "Witch";
		        } else if (role == 3) {
		            return "Villager";
		        } else if (role == 4) {
		            return "Werewolf";
		        } else if (role == 5) {
		            return "Hunter";
		        } else if (role == 6) {
		            return "Twin";
		        }
		    };


		    $scope.updateGameState = function (updatedGame) {
		        if ($scope.game.CurrentGameState == updatedGame.CurrentGameState)
		            return;

		        if (!updatedGame.GameStarted)
		            return;

		        if ($scope.game.CurrentGameState == 1 && updatedGame.CurrentGameState == 2) {
		            //Day to fortune teller
		            $scope.isDay = false
		            $scope.isFortuneTeller = true;

		        } else if ($scope.game.CurrentGameState == 1 && updatedGame.CurrentGameState == 5) {
		            //Day to hunter
		            $scope.isDay = false;
		            $scope.isHunter = true;

		        } else if ($scope.game.CurrentGameState == 5 && updatedGame.CurrentGameState == 2) {
		            //Hunter to fortune teller
		            $scope.isHunter = false;
		            $scope.isFortuneTeller = true;

		        } else if ($scope.game.CurrentGameState == 2 && updatedGame.CurrentGameState == 3) {
		            //Fortune teller to werewolves
		            $scope.isFortuneTeller = false;
		            $scope.isWerewolves = true;

		        } else if ($scope.game.CurrentGameState == 3 && updatedGame.CurrentGameState == 4) {
		            //Werewolves to witch
		            $scope.isWerewolves = false;
		            $scope.isWitch = true;

		        } else if ($scope.game.CurrentGameState == 4 && updatedGame.CurrentGameState == 1) {
		            //Witch To day
		            $scope.isWitch = false;
		            $scope.isDay = true;

		        } else {
		            alert("WTF ARE YOU DOING. THIS ISNT SUPPOSED TO HAPPEN!?!?!?");
		        }


		    };





		    $scope.hub = $.connection.werewolfHub; // initializes hub
		    $.connection.hub.start(); // starts hub

		    $scope.joinGame = function () {
		        if (!$scope.game.GameStarted) {
		            $scope.hub.server.joinGame($scope.username);
		            $scope.haveJoinedGame = true;
		        }
		    };

		    //receive
		    $scope.hub.client.updateGame = function (game) {
		        $scope.updateGameState(game);
		        $scope.game = game;
		        $scope.$apply();
		        $scope.determineRole();
		        $scope.$apply();

		    };

		    $scope.determineRole = function () {
		        if (haveJoinedGame && $scope.game.HasStarted) {
		            var result = $scope.game.Players.filter(function (obj) {
		                return obj.username == $scope.username;
		            });
		            if (result) {
		                if (result.Role == 1) {
		                    $scope.role = "Fortune Teller";
		                } else if (result.Role == 2) {
		                    $scope.role = "Witch";
		                } else if (result.Role == 3) {
		                    $scope.role = "Villager";
		                } else if (result.Role == 4) {
		                    $scope.role = "Werewolf";
		                    $scope.othersInSameRole = [];
		                    angular.forEach($scope.game.Players, function (player) {
		                        if (player.Role == 4 && player.Username !== $scope.username) {
		                            $scope.othersInSameRole.push(player.Username);
		                        }
		                    });

		                } else if (result.Role == 5) {
		                    $scope.role = "Hunter";
		                } else if (result.Role == 6) {
		                    $scope.role = "Twin";
		                    var otherTwin = $scope.game.Players.filter(function (obj) {
		                        return obj.username !== $scope.username && obj.Role == 6;
		                    });
		                    $scope.othersInSameRole = [];
		                    $scope.othersInSameRole.push(otherTwin.Username);
		                }
		                //You were killed. Remove you from game
		            } else {
		                $scope.haveJoinedGame = false;
		            }
		        }
		    };
		    //send
		    $scope.startGame = function () {
		        $scope.hub.server.startGame();
		    };

		    $scope.endGame = function () {
		        $scope.hub.server.endGame();
		    };

		    $scope.removePlayer = function (username) {
		        $scope.hub.server.removePlayer(username);
		    };

		    $scope.witchActions = function () {
		        var save = "";
		        var kill = $scope.witchKilling;
		        if ($scope.witchSaved) {
		            save = $scope.playerKilled;
		        }

		        $scope.hub.server.witchActions(save, kill);
		    };

		    $scope.killPlayerByWerewolves = function (username) {
		        $scope.playerKilled = username;
		        $scope.hub.server.killPlayerByWerewolves(username);
		    };

		    $scope.advancePastFortuneTeller = function () {
		        $scope.hub.server.advancePastFortuneTeller();
		    };

		    $scope.hunterKill = function (username) {
		        $scope.hub.server.hunterKill(username);
		    };

		    $scope.lynchPlayer = function (username) {
		        $scope.hub.server.lynchPlayer(username);
		    };

		    $scope.resetGame = function () {
		        $scope.username = "";
		        $scope.playerRole;
		        $scope.burnCards = 0;
		        $scope.isDay = false;
		        $scope.isFortuneTeller = false;
		        $scope.isHunter = false;
		        $scope.isWerewolves = false;
		        $scope.isWitch = false;
		        $scope.role = "";
		        $scope.haveJoinedGame = false;
		        $scope.hub.server.resetGame();
		    };
		}
	]
);