using Microsoft.Owin;
using Owin;
[assembly: OwinStartup(typeof(Werewolf.Web.Startup))]

namespace Werewolf.Web
{
	
	public class Startup
	{
		public void Configuration(IAppBuilder app)
		{
			app.MapSignalR();
		}
	}
	
}