var app = angular.module("werewolf").controller("HomeController",
	["$scope", "PreloadService", "GameService", "$timeout",
		function ($scope, preloadService, gameService, $timeout) {
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
		    $scope.useAudio = false;
		    $scope.othersInSameRole = [];
		    $scope.showRelatedPlayers = $scope.othersInSameRole.length > 0;
		    
		    $scope.toggleAudio = function () {
		    	$scope.useAudio = !$scope.useAudio;
		    };
		    $scope.playAudio = function (text) {
		    	if (!$scope.useAudio)
		    		return;

		    	if (window.speechSynthesis) {
		    		var msg = new SpeechSynthesisUtterance();
		    	}
		    	msg.volume =  1;
		    	msg.rate = 0.5;
		    	msg.pitch = 1;
				//message for speech
		    	msg.text = text;
				speechSynthesis.speak(msg);
		    	
		    	//var audio = new Audio('Content/tone.mp3');
		        //audio.play();
		    };
			//comment to check in
		    $scope.playLynching = function (username) {
		    	var players = $scope.game.Players.filter(function (obj) {
		    		return obj.Username == username;
		    	});
		    	var selectedPlayer = players[0];
		    	$scope.playAudio("You have all decided to kill " + username + ". They were a " + $scope.getRoleNameFor(selectedPlayer.Role));
		    };

		    $scope.playWerewolfInstructions = function () {
		    	$scope.playAudio("Thank you.  Please go to sleep.");
		    	
		    	function finishInstructions() {
		    		$scope.playAudio("Can my wearewolves awaken.");
		    		$scope.playAudio("Please select someone to kill tonight");
		    	}

		    	$timeout(finishInstructions, 2000);
		    };

		    $scope.playFortuneTellerInstructions = function () {
		    	$scope.playAudio("Can the village fall asleep?");
		    	function finishInstructions() {
		    		//Spelling mistakes are correct for the talk to text to sound right
		    		$scope.playAudio("Can my fortune teller awaken.");
		    		$scope.playAudio("Who's role would you like to see");
		    	}

		    	$timeout(finishInstructions, 2000);
		    };

		    $scope.playWitchInstructions = function () {
		    	$scope.playAudio("Thank you.  Please go to sleep.");

		    	function finishInstructions() {
		    		$scope.playAudio("Can my witch awaken.");
		    		$scope.playAudio("Would you like to do anything tonight?");
		    	}

		    	$timeout(finishInstructions, 2000);
		    };

		    $scope.playStartofDay = function (peopleWhoDied) {
		    	$scope.playAudio("Can everyone wake up.");

		    	if(peopleWhoDied.length = 0){
		    		$scope.playAudio("Last night was a relatively peaceful night.  It is a rare sight as there were no deaths.");
		    	}else if(peopleWhoDied.length = 1){
		    		$scope.playAudio("Last night was a terrible night.  Sadly, " + peopleWhoDied[0].Username + " was found mauled to death in their bed.  They were a " + $scope.getRoleNameFor(peopleWhoDied[0].Role));
		    	}else if(peopleWhoDied.length = 2){
		    		$scope.playAudio("Last night was a terrible night.  Sadly, " + peopleWhoDied[0].Username + " was found mauled to death in their bed.  They were a " + $scope.getRoleNameFor(peopleWhoDied[0].Role));
		    		$scope.playAudio("Even more devastating is that " + peopleWhoDied[1].Username + " was also found strangled to death in their living room.  They were a " + $scope.getRoleNameFor(peopleWhoDied[0].Role));
		    	}

		    };
		    
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
		        var players = $scope.game.Players.filter(function (obj) {
		            return obj.Username == username;
		        });
		        $scope.selectedPlayer = players[0];
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

		        if (!$scope.game.GameStarted && updatedGame.GameStarted) {
		            $scope.isDay = true;
		            $scope.isFortuneTeller = false;
		            $scope.isHunter = false;
		            $scope.isWerewolves = false;
		            $scope.isWitch = false;
		            $scope.$apply();
		            $scope.playAudio("The game has started.  Who would you like to kill today?");
		            return;
		        }


		        if ($scope.game.CurrentGameState == 1 && updatedGame.CurrentGameState == 2) {
		            //Day to fortune teller
		            $scope.isDay = false
		            $scope.isFortuneTeller = true;
		            $scope.playFortuneTellerInstructions();

		        } else if ($scope.game.CurrentGameState == 1 && updatedGame.CurrentGameState == 5) {
		            //Day to hunter
		            $scope.isDay = false;
		            $scope.isHunter = true;
					//TODO: Play hunter instructions ------------------------------------------------------------------------

		        } else if ($scope.game.CurrentGameState == 5 && updatedGame.CurrentGameState == 2) {
		            //Hunter to fortune teller
		            $scope.isHunter = false;
		            $scope.isFortuneTeller = true;
		            $scope.playFortuneTellerInstructions();

		        } else if ($scope.game.CurrentGameState == 2 && updatedGame.CurrentGameState == 3) {
		            //Fortune teller to werewolves
		            $scope.isFortuneTeller = false;
		            $scope.isWerewolves = true;
		            $scope.playWerewolfInstructions();

		        } else if ($scope.game.CurrentGameState == 3 && updatedGame.CurrentGameState == 4) {
		            //Werewolves to witch
		            $scope.isWerewolves = false;
		            $scope.isWitch = true;
		            $scope.playWitchInstructions();

		        } else if ($scope.game.CurrentGameState == 4 && updatedGame.CurrentGameState == 1) {
		            //Witch To day
		            $scope.isWitch = false;
		            $scope.isDay = true;
		            $scope.playStartofDay();
					//WTF IS GOING ON HERE

		        } else if ($scope.game.CurrentGameState == 1 && updatedGame.CurrentGameState == 3) {
		        	//day To werewolves
		        	$scope.isWerewolves = true;
		        	$scope.isDay = false;
		        	$scope.playWerewolfInstructions();

		        } else {
		        	console.log("CurrentState: " + $scope.game.CurrentGameState);
		        	console.log("NextStage: " + updatedGame.CurrentGameState);
		            alert("WTF ARE YOU DOING. THIS ISNT SUPPOSED TO HAPPEN!?!?!?");
		        }

		        $scope.$apply();
		    };





		    $scope.hub = $.connection.werewolfHub; // initializes hub
		    $.connection.hub.start(); // starts hub

		    $scope.joinGame = function () {
		        if (!$scope.game.GameStarted) {
		            $scope.hub.server.joinGame($scope.username);
		            $scope.haveJoinedGame = true;
						            
		            $scope.playAudio($scope.username + " has joined the game.");
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

		    $scope.hub.client.resetGame = function (game) {
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
		        $scope.game = game;
		    };

		    $scope.determineRole = function () {
		        if ($scope.haveJoinedGame && $scope.game.GameStarted) {
		            var result = $scope.game.Players.filter(function (obj) {
		                return obj.Username == $scope.username;
		            });
		            if (result) {
		                result = result[0];
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
		                        return obj.Username !== $scope.username && obj.Role == 6;
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
		        $scope.hub.server.startGame($scope.burnCards);
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