using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Werewolf.Models
{
    public class Witch : Player
    {
        public bool CanSave { get; set; }
        public bool CanKill { get; set; }
    }
}
