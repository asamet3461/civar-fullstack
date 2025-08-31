using System.Text;
using System.Text.Json;
using Civar.Application.Interfaces;
using RabbitMQ.Client;

namespace Civar.Infrastructure.RabbitMQ
{
    public class EmailNotificationPublisher : IEmailNotificationService
    {
        private readonly RabbitMqConnectionService _connectionService;

        public EmailNotificationPublisher(RabbitMqConnectionService connectionService)
        {
            _connectionService = connectionService;
        }

        public void SendNotification(string to, string subject, string body)
        {
            var channel = _connectionService.GetChannel();
            var queueName = "email_notifications";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var message = JsonSerializer.Serialize(new { To = to, Subject = subject, Body = body });
            var bodyBytes = Encoding.UTF8.GetBytes(message);

            channel.BasicPublish(exchange: "", routingKey: queueName, basicProperties: null, body: bodyBytes);
        }
    }
}