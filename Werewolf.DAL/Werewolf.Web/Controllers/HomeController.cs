using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Werewolf.Models;

namespace Werewolf.Web.Controllers
{
    public class HomeController : Controller
    {
		public static WerewolfGame _game = new WerewolfGame();

        public ActionResult Index(string username)
        {
			return View(_game);
        }

    }
}
