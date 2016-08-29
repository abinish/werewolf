using System;
using System.Web;
using System.Linq;
using System.Collections.Generic;
using Microsoft.AspNet.SignalR;
using Werewolf.Models;
using System.Threading;

namespace Werewolf.Web.Hubs
{
	public class WerewolfHub : Hub
	{
		public void Send(string name, string message)
		{

			//Clients.Groups[""].
			// Call the addNewMessageToPage method to update clients.
			Clients.All.addNewMessageToPage(name, message);
		}

		public void JoinGame(string username)
		{
			//If game has started you cannot join
			if (!Controllers.HomeController._game.GameStarted)
			{
				Controllers.HomeController._game.Players.Add(new Werewolf.Models.Player { Username = username, IsPlayerAlive = true });

				Clients.All.updateGame(Controllers.HomeController._game);
			}
		}

		public void RemovePlayer(string username)
		{
			Controllers.HomeController._game.Players = Controllers.HomeController._game.Players.Where(_ => _.Username != username).ToList();
			Clients.All.updateGame(Controllers.HomeController._game);
		}

		public void StartGame(int burnCards)
		{
			Controllers.HomeController._game.BurnCards = burnCards;
			Controllers.HomeController._game.InitializeGame();
			Clients.All.updateGame(Controllers.HomeController._game);
		}

		public void LynchPlayer(string username)
		{
			var player = Controllers.HomeController._game.Players.Single(x => x.Username == username);
			Controllers.HomeController._game.KilledPlayers.Add(player);
			Controllers.HomeController._game.Players.Remove(player);
			if (player.Role == Role.Hunter)
			{
				Controllers.HomeController._game.CurrentGameState = GameState.Hunter;
				Clients.All.updateGame(Controllers.HomeController._game);
			}
			else //Need to support the case where fortune teller is dead
			{
				AdvanceToFortuneTeller();
			}
		}

		private void AdvanceToFortuneTeller()
		{
			Controllers.HomeController._game.CurrentGameState = GameState.FortuneTeller;

			var fortuneTellerAlive = Controllers.HomeController._game.Players.Any(_ => _.Role == Role.FortuneTeller);
			var fortuneTellerInGame = !Controllers.HomeController._game.BurnedRoles.Any(_ => _ == Role.FortuneTeller);

			if (!fortuneTellerAlive && fortuneTellerInGame)
			{
				Controllers.HomeController._game.CurrentGameState = GameState.Werewolves;
				Controllers.HomeController._game.KilledPlayers = new List<Player>();
			}
			else if (!fortuneTellerInGame)
			{
				Clients.All.updateGame(Controllers.HomeController._game);
				Thread.Sleep(10000);
				Controllers.HomeController._game.CurrentGameState = GameState.Werewolves;
				Controllers.HomeController._game.KilledPlayers = new List<Player>();
			}
			Clients.All.updateGame(Controllers.HomeController._game);
		}

		public void HunterKill(string username)
		{
			var player = Controllers.HomeController._game.Players.Single(x => x.Username == username);
			Controllers.HomeController._game.KilledPlayers.Add(player);
			Controllers.HomeController._game.Players.Remove(player);

			AdvanceToFortuneTeller();
		}

		public void AdvancePastFortuneTeller()
		{
			Controllers.HomeController._game.CurrentGameState = GameState.Werewolves;
			Controllers.HomeController._game.KilledPlayers = new List<Player>();
			Clients.All.updateGame(Controllers.HomeController._game);
		}

		public void KillPlayerByWerewolves(string username)
		{
			var player = Controllers.HomeController._game.Players.Single(x => x.Username == username);
			Controllers.HomeController._game.KilledPlayers.Add(player);
			Controllers.HomeController._game.Players.Remove(player);
			AdvanceToWitch();
		}

		private void AdvanceToWitch()
		{
			Controllers.HomeController._game.CurrentGameState = GameState.Witch	;

			var witchAlive = Controllers.HomeController._game.Players.Any(_ => _.Role == Role.Witch);
			var witchInGame = !Controllers.HomeController._game.BurnedRoles.Any(_ => _ == Role.Witch);

			if (!witchAlive && witchInGame)
			{
				Controllers.HomeController._game.CurrentGameState = GameState.Day;
			}
			else if (!witchInGame)
			{
				Clients.All.updateGame(Controllers.HomeController._game);
				Thread.Sleep(10000);
				Controllers.HomeController._game.CurrentGameState = GameState.Day;
			}
			Clients.All.updateGame(Controllers.HomeController._game);
		}


		public void WitchActions(string savedPlayer, string killedPlayer)
		{
			if (Controllers.HomeController._game.WitchHasSaveRemaining && !string.IsNullOrEmpty(savedPlayer))
			{
				if (Controllers.HomeController._game.KilledPlayers.Any(x => x.Username == savedPlayer))
				{
					var player = Controllers.HomeController._game.KilledPlayers.Single(x => x.Username == savedPlayer);
					Controllers.HomeController._game.WitchHasSaveRemaining = false;
					Controllers.HomeController._game.Players.Add(player);
				}
			}

			if (Controllers.HomeController._game.WitchHasKillRemaining && !string.IsNullOrEmpty(killedPlayer))
			{
				if (Controllers.HomeController._game.Players.Any(x => x.Username == killedPlayer))
				{
					var player = Controllers.HomeController._game.Players.Single(x => x.Username == killedPlayer);
					Controllers.HomeController._game.WitchHasKillRemaining = false;
					Controllers.HomeController._game.KilledPlayers.Add(player);
					Controllers.HomeController._game.Players.Remove(player);
				}
			}
			
			Controllers.HomeController._game.CurrentGameState = GameState.Day;
			Clients.All.updateGame(Controllers.HomeController._game);
		}

		public void ResetGame()
		{
			Controllers.HomeController._game = new WerewolfGame();
			Clients.All.resetGame(Controllers.HomeController._game);
		}



	}
}