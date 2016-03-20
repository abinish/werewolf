using Microsoft.Owin;
using Owin;

namespace Werewolf.Web
{
	[assembly: OwinStartup(typeof(Werewolf.Web.Startup))]
	public class Startup
	{
		public void Configuration(IAppBuilder app)
		{
			app.MapSignalR();
		}
	}
	
}