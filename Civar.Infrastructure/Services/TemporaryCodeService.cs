using System;
using System.Threading.Tasks;
using Civar.Application.Interfaces;
using Civar.Infrastructure.Redis;

namespace Civar.Infrastructure.Services
{
    public class TemporaryCodeService : ITemporaryCodeService
    {
        private readonly RedisConnectionService _redis;

        public TemporaryCodeService(RedisConnectionService redis)
        {
            _redis = redis;
        }

        public async Task<long> IncrementRateLimitAsync(string key, TimeSpan window)
        {
            var count = await _redis.Database.StringIncrementAsync(key);
            if (count == 1)
                await _redis.Database.KeyExpireAsync(key, window);
            return count;
        }

        public async Task SetCodeAsync(string key, string code, TimeSpan expiresIn)
        {
            try
            {
                var result = await _redis.Database.StringSetAsync(key, code, expiresIn);
                if (!result)
                    Console.WriteLine($"Redis'e yazılamadı: {key} - {code}");
                else
                    Console.WriteLine($"Redis'e yazıldı: {key} - {code}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Redis'e yazarken hata: {ex.Message}");
            }
        }

        public async Task<bool> ValidateCodeAsync(string key, string code)
        {
            var storedCode = await _redis.Database.StringGetAsync(key);
            return storedCode == code;
        }

        public async Task DeleteCodeAsync(string key)
        {
            await _redis.Database.KeyDeleteAsync(key);
        }
    }
}