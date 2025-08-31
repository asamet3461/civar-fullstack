using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Civar.Application.Interfaces;

namespace Civar.Api.Middlewares
{
    public class UserActivityMiddleware
    {
        private readonly RequestDelegate _next;

        public UserActivityMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserActivityService userActivityService)
        {
     
            if (context.Request.Path.HasValue
                && context.Request.Path.Value.TrimEnd('/').EndsWith("/api/user/activity/mark-offline", StringComparison.OrdinalIgnoreCase))
            {
                await _next(context);
                return;
            }

            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userId, out var guid))
                {
                    await userActivityService.UpdateLastSeenAsync(guid);
                }
            }
            await _next(context);
        }
    }
}