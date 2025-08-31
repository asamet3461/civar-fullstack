using System;
using System.Threading.Tasks;
using Civar.Application.Interfaces;
using Civar.Infrastructure.Redis;

namespace Civar.Infrastructure.Services
{
    public class UserActivityService : IUserActivityService
    {
        private readonly RedisConnectionService _redis;

        public UserActivityService(RedisConnectionService redis)
        {
            _redis = redis;
        }

        public async Task UpdateLastSeenAsync(Guid userId)
        {
            await _redis.Database.StringSetAsync($"user:lastseen:{userId}", DateTime.UtcNow.ToString("o"));
        }

        public async Task<(bool isOnline, DateTime? lastSeen)> GetUserStatusAsync(Guid userId)
        {
            var lastSeenStr = await _redis.Database.StringGetAsync($"user:lastseen:{userId}");
            if (lastSeenStr.IsNullOrEmpty) return (false, null);

            if (DateTime.TryParse(lastSeenStr, out var lastSeen))
            {
                var isOnline = (DateTime.UtcNow - lastSeen) < TimeSpan.FromSeconds(15);
                return (isOnline, lastSeen);
            }

            return (false, null);
        }

        public async Task MarkOfflineAsync(Guid userId)
        {
            await _redis.Database.KeyDeleteAsync($"user:lastseen:{userId}");
        }
    }
}