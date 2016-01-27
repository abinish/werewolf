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
    }
}
