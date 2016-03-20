using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Werewolf.Web.Models
{
	public class GamePlayerModel
	{
		public Werewolf.Models.WerewolfGame game { get; set; }

		public string currentPlayer { get; set; }
	}
}