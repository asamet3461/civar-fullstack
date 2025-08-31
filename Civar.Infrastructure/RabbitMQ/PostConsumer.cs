using System;
using System.Text;
using System.Text.Json;
using Civar.Application.Events;
using Microsoft.Extensions.Caching.Memory;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Civar.Infrastructure.RabbitMQ
{
    public class PostConsumer
    {
        private readonly RabbitMqConnectionService _connectionService;
        private readonly IMemoryCache _cache;

        public PostConsumer(RabbitMqConnectionService connectionService, IMemoryCache cache)
        {
            _connectionService = connectionService;
            _cache = cache;
        }

        public void StartConsuming()
        {
            var channel = _connectionService.GetChannel();
            var queueName = "posts";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var post = JsonSerializer.Deserialize<PostMessage>(message);

                if (post != null)
                {
                    var cacheKey = $"post:{post.PostId}";
                    _cache.Set(cacheKey, post, TimeSpan.FromMinutes(30));
                }
            };

            channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);
        }
    }
}