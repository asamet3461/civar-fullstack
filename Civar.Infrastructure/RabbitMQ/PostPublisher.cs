using System.Text;
using System.Text.Json;
using Civar.Application.Events;

namespace Civar.Infrastructure.RabbitMQ
{
    public class PostPublisher
    {
        private readonly RabbitMqConnectionService _connectionService;

        public PostPublisher(RabbitMqConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        public void PublishPost(PostMessage post)
        {
            var channel = _connectionService.GetChannel();
            var queueName = "posts";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var message = JsonSerializer.Serialize(post);
            var body = Encoding.UTF8.GetBytes(message);

            channel.BasicPublish(
                exchange: "",
                routingKey: queueName,
                mandatory: false, 
                basicProperties: null,
                body: body
            );
        }
    }
}