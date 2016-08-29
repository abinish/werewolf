using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Werewolf.Models
{
    public class WerewolfGame
    {
		public WerewolfGame()
		{
			Players = new List<Player>();
			KilledPlayers = new List<Player>();
		}

        #region Properties

		public bool GameStarted { get; set; }
        public IList<Player> Players { get; set; }
		public int BurnCards { get; set; }
		public IList<Role> BurnedRoles { get; set; }
		public IList<Player> KilledPlayers { get; set; }
		public GameState CurrentGameState { get; set; }
		public bool WitchHasKillRemaining { get; set; }
		public bool WitchHasSaveRemaining { get; set; }
		public bool DidWerewolvesWin { get; set; }
		public bool DidVillagersWin { get; set; }

        #endregion

		public void InitializeGame()
		{
			WitchHasKillRemaining = true;
			WitchHasSaveRemaining = true;
			DetermineRoles();
			CurrentGameState = GameState.Day;
			GameStarted = true;

		}

		public void DetermineRoles()
		{
			var roles = new List<Role>();
			var cardsToUse = BurnCards + Players.Count;

			roles = GenerateRolePossibilities(cardsToUse);

			foreach (var player in Players)
			{
				var random = new Random();
				var value = random.Next(roles.Count);
				var role = roles[value];
				roles.RemoveAt(value);
				player.Role = role;
			}

			BurnedRoles = roles;
		}

		public void IsGameOver()
		{
			var werewolves = Players.Count(x => x.Role == Role.Werewolf);
			var villagers = Players.Count() - werewolves;
			if (werewolves == 0)
				DidVillagersWin = true;

			if (werewolves > villagers)
				DidWerewolvesWin = true;
		}


		public List<Role> GenerateRolePossibilities(int cardsToUse)
		{
			var roles = new Dictionary<int, Role>();
			roles.Add(1, Role.Villager);
			roles.Add(2, Role.Werewolf);
			roles.Add(3, Role.Villager);
			roles.Add(4, Role.Witch);
			roles.Add(5, Role.FortuneTeller);
			roles.Add(6, Role.Villager);
			roles.Add(7, Role.Werewolf);
			roles.Add(8, Role.Hunter);
			roles.Add(9, Role.Villager);
			roles.Add(10, Role.Werewolf);
			roles.Add(11, Role.Villager);
			roles.Add(12, Role.Twin);
			roles.Add(13, Role.Werewolf);
			roles.Add(14, Role.Villager);
			roles.Add(15, Role.Villager);
			roles.Add(16, Role.Werewolf);
			roles.Add(17, Role.Villager);
			roles.Add(18, Role.Villager);

			//If we have 12 or more we need to add the other twin
			if (cardsToUse > 11)
				roles[1] = Role.Twin;

			return roles.Where(_ => _.Key <= cardsToUse).Select(x => x.Value).ToList();
		}

        #region Getters
        public Role GetPlayersRole(string username)
        {
            return Players.Single(x => x.Username.Equals(username)).Role;
        }

        #endregion


        #region PlayerActions
        public Role KillPlayer(string username)
        {
            var role = GetPlayersRole(username);
			KilledPlayers = Players.Where(x => !x.Username.Equals(username)).ToList();
            Players = Players.Where(x => !x.Username.Equals(username)).ToList();

            return role;
        }


        #endregion




    }
}
