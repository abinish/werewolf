var app = angular.module("werewolf").controller("HomeController",
	["$scope", "PreloadService", "GameService", "$timeout",
		function ($scope, preloadService, gameService, $timeout) {
			$scope.game = angular.copy(preloadService.GetPreloadedData("Game"));
			$scope.players = $scope.game.Players;
			$scope.username = "";
			$scope.playerRole;
			$scope.burnCards = 0;
			$scope.Role = "";
			$scope.haveJoinedGame = false;
			$scope.useAudio = false;
			$scope.othersInSameRole = [];
			$scope.showRelatedPlayers = $scope.othersInSameRole.length > 0;

			//*************** AUDIO ***************************
			$scope.toggleAudio = function () {
				$scope.useAudio = !$scope.useAudio;
			};
			$scope.playAudio = function (text) {
				if (!$scope.useAudio)
					return;

				if (window.speechSynthesis) {
					var msg = new SpeechSynthesisUtterance();
				}
				msg.volume = 1;
				msg.rate = 0.5;
				msg.pitch = 1;
				//message for speech
				msg.text = text;
				speechSynthesis.speak(msg);

				//var audio = new Audio('Content/tone.mp3');
				//audio.play();
			};

			$scope.playLynching = function (username) {
				var players = $scope.game.Players.filter(function (obj) {
					return obj.Username == username;
				});
				var selectedPlayer = players[0];
				$scope.playAudio("You have all decided to kill " + username + ". They were a " + selectedPlayer.RoleName);
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
				//TODO: Add hunter kill logic

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

			$scope.playStartofDay = function () {
				$scope.playAudio("Can everyone wake up.");

				if ($scope.game.KilledPlayers.length === 0) {
					$scope.playAudio("Last night was a peaceful night.  It is a rare sight as there were no deaths.");
				} else if ($scope.game.KilledPlayers.length === 1) {
					$scope.playAudio("Last night was a tragic night.  Sadly, " + $scope.game.KilledPlayers[0].Username + " was found mauled to death in their bed.  They were a " + $scope.game.KilledPlayers[0].RoleName);
				} else if ($scope.game.KilledPlayers.length === 2) {
					$scope.playAudio("Last night was a horific night.  Sadly, " + $scope.game.KilledPlayers[0].Username + " was found mauled to death in their bed.  They were a " + $scope.game.KilledPlayers[0].RoleName);
					$scope.playAudio("Even more devastating is that " + $scope.game.KilledPlayers[1].Username + " was also found strangled to death in their living room.  They were a " + $scope.game.KilledPlayers[0].RoleName);
				}

			};

			//*********************END AUDIO*********************************









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

			$scope.isPlayerWerewolf = function () {
				return $scope.Role === "Werewolf";
			};

			$scope.isPlayerHunter = function () {
				return $scope.Role === "Hunter";
			};

			$scope.isPlayerWitch = function () {
				return $scope.Role === "Witch";
			};

			$scope.isPlayerFortuneTeller = function () {
				return $scope.Role === "Fortune Teller";
			};

			$scope.showPlayer = function (username) {
				$scope.hasSeenPlayer = true;
				var players = $scope.game.Players.filter(function (obj) {
					return obj.Username == username;
				});
				$scope.selectedPlayer = players[0];
			};

			$scope.updateGameState = function (updatedGame) {
				if ($scope.game.CurrentGameState == updatedGame.CurrentGameState)
					return;

				if (!updatedGame.GameStarted)
					return;

				if (!$scope.game.GameStarted && updatedGame.GameStarted) {
					$scope.playAudio("The game has started.  Who would you like to kill today?");
					return;
				}

				if (updatedGame.CurrentGameState == 1) {
					//Day
					$scope.playStartofDay();
				} else if (updatedGame.CurrentGameState == 2) {
					//Fortune teller
					$scope.hasSeenPlayer = false;
					$scope.playFortuneTellerInstructions();

				} else if (updatedGame.CurrentGameState == 3) {
					//werewolves
					$scope.playWerewolfInstructions();

				} else if (updatedGame.CurrentGameState == 4) {
					//Witch
					$scope.playWitchInstructions();

				} else if (updatedGame.CurrentGameState == 5) {
					//Hunter
					//TODO: Play hunter instructions ------------------------------------------------------------------------

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
				$scope.Role = "";
				$scope.haveJoinedGame = false;
				$scope.game = game;
			};

			$scope.determineRole = function () {
				if ($scope.haveJoinedGame && $scope.game.GameStarted) {
					var result = $scope.game.Players.filter(function (obj) {
						return obj.Username == $scope.username;
					});
					if (result && result.length === 1) {
						resultingPlayer = result[0];
						$scope.Role = resultingPlayer.RoleName;

						$scope.othersInSameRole = [];
						//If they are a twin or werewolf then let them know the others
						if (resultingPlayer.Role === 4 || resultingPlayer.Role === 6) {
							angular.forEach($scope.game.Players, function (player) {
								if (player.Role === resultingPlayer.Role && player.Username !== $scope.username) {
									$scope.othersInSameRole.push(player.Username);
								}
							});
						}

						//You were killed. Remove you from game
					} else {
						var witchKilledByWerewolves = $scope.game.WerewolfKilledPlayer && $scope.game.WerewolfKilledPlayer.Role === 2 && $scope.Role === 'Witch' && $scope.game.CurrentGameState === 4;

						if (!witchKilledByWerewolves) {
							$scope.haveJoinedGame = false;
						}
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
					save = $scope.game.WerewolfKilledPlayer.Username;
				}

				$scope.hub.server.witchActions(save, kill);
			};

			$scope.killPlayerByWerewolves = function (username) {
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
				$scope.Role = "";
				$scope.haveJoinedGame = false;
				$scope.hub.server.resetGame();
			};
		}
	]
);