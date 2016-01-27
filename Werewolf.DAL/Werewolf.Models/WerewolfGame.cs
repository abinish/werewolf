using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Werewolf.Models
{
    public class WerewolfGame
    {

        
       

        #region Properties
        public string Host { get; set; }
        public IEnumerable<Player> Players { get; set; }
        public Witch Witch { get; set; }
        public Player FortuneTeller { get; set; }
        public Player Hunter { get; set; }
        public Player Twin1 { get; set; }
        public Player Twin2 { get; set; }

        #endregion

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
            Players = Players.Where(x => !x.Username.Equals(username));

            if (role == Role.Witch)
            {
                Witch.IsPlayerAlive = false;
            }
            else if (role == Role.FortuneTeller)
            {
                FortuneTeller.IsPlayerAlive = false;
            }
            return role;
        }


        #endregion




        #region Constructor
        public WerewolfGame(IList<string> players, string Host, int numberBurnCards)
        {
            //Insert logic for determining roles
        }
        #endregion


    }
}
