using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Civar.Infrastructure.Redis;

namespace Civar.Api.Middlewares
{
    public class RedisRateLimitMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly int _limit;
        private readonly TimeSpan _window;

        public RedisRateLimitMiddleware(RequestDelegate next, int limit = 30, int windowSeconds = 60)
        {
            _next = next;
            _limit = limit;
            _window = TimeSpan.FromSeconds(windowSeconds);
        }

        public async Task InvokeAsync(HttpContext context, RedisConnectionService redis)
        {
            if (context.Request.Method == "GET")
            {
                await _next(context);
                return;
            }

            if (context.User.Identity?.IsAuthenticated == true)
            {
                var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (Guid.TryParse(userId, out var guid))
                {
                    var key = $"ratelimit:{guid}";
                    var db = redis.Database;

                    var count = await db.StringIncrementAsync(key);
                    if (count == 1)
                        await db.KeyExpireAsync(key, _window);

                    if (count > _limit)
                    {
                        context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                        await context.Response.WriteAsync("Rate limit exceeded.");
                        return;
                    }
                }
            }
            await _next(context);
        }
    }
}