using System;
using System.Text;
using System.Text.Json;
using Civar.Application.Events;
using Microsoft.Extensions.Caching.Memory;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Civar.Infrastructure.RabbitMQ
{
    public class EventConsumer
    {
        private readonly RabbitMqConnectionService _connectionService;
        private readonly IMemoryCache _cache;

        public EventConsumer(RabbitMqConnectionService connectionService, IMemoryCache cache)
        {
            _connectionService = connectionService;
            _cache = cache;
        }

        public void StartConsuming()
        {
            var channel = _connectionService.GetChannel();
            var queueName = "events";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var evt = JsonSerializer.Deserialize<EventMessage>(message);

                if (evt != null)
                {
                    var cacheKey = $"event:{evt.EventId}";
                    _cache.Set(cacheKey, evt, TimeSpan.FromMinutes(30));
                }
            };

            channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);
        }
    }
}