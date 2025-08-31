using System.Threading.Tasks;
using Civar.Application.Interfaces;
using StackExchange.Redis;

namespace Civar.Infrastructure.Redis
{
    public class RedisMessagePublisher : IMessagePublisher
    {
        private readonly ISubscriber _subscriber;
        public RedisMessagePublisher(RedisConnectionService redis)
        {
            _subscriber = redis.Subscriber;
        }
        public Task PublishAsync(string channel, string message)
        {
            return _subscriber.PublishAsync(channel, message);
        }
    }
}