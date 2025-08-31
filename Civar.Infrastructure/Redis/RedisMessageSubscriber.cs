using System;
using StackExchange.Redis;

namespace Civar.Infrastructure.Redis
{
    public class RedisMessageSubscriber
    {
        private readonly ISubscriber _subscriber;
        public RedisMessageSubscriber(RedisConnectionService redis)
        {
            _subscriber = redis.Subscriber;
        }
        public void Subscribe(string channel, Action<RedisChannel, RedisValue> handler)
        {
            _subscriber.Subscribe(channel, handler);
        }
    }
}