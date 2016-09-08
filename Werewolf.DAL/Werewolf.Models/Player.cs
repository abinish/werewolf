using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Werewolf.Models
{
    public class Player
    {
        public string Username { get; set; }
        public bool IsPlayerAlive { get; set; }
        public Role Role { get; set; }
        public string RoleName { get
            {
                switch (Role)
                {
                    case Role.Twin:
                        return "Twin";
                    case Role.Villager:
                        return "Villager";
                    case Role.Werewolf:
                        return "Werewolf";
                    case Role.Witch:
                        return "Witch";
					case Role.Hunter:
						return "Hunter";
					case Role.FortuneTeller:
						return "Fortune Teller";
                }
				return "";
            } }
    }
}
