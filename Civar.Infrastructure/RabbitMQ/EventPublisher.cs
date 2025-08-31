using System.Text;
using System.Text.Json;
using Civar.Application.Events;
using RabbitMQ.Client;

namespace Civar.Infrastructure.RabbitMQ
{
    public class EventPublisher
    {
        private readonly RabbitMqConnectionService _connectionService;

        public EventPublisher(RabbitMqConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        public void PublishEvent(EventMessage evt)
        {
            var channel = _connectionService.GetChannel();
            var queueName = "events";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var message = JsonSerializer.Serialize(evt);
            var body = Encoding.UTF8.GetBytes(message);

            channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: body);
        }
    }
}