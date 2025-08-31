using System.Text;
using System.Text.Json;
using Civar.Application.Interfaces;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;

namespace Civar.Infrastructure.RabbitMQ
{
    public class EmailNotificationConsumer : BackgroundService
    {
        private readonly RabbitMqConnectionService _connectionService;
        private readonly IServiceProvider _serviceProvider;

        public EmailNotificationConsumer(RabbitMqConnectionService connectionService, IServiceProvider serviceProvider)
        {
            _connectionService = connectionService;
            _serviceProvider = serviceProvider;
        }

        protected override Task ExecuteAsync(CancellationToken stoppingToken)
        {
            
            using (var scope = _serviceProvider.CreateScope())
            {
                var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();
                StartConsuming(emailService);
            }
            return Task.CompletedTask;
        }

        private void StartConsuming(IEmailService emailService)
        {
            var channel = _connectionService.GetChannel();
            var queueName = "email_notifications";
            channel.QueueDeclare(queue: queueName, durable: false, exclusive: false, autoDelete: false, arguments: null);

            var consumer = new EventingBasicConsumer(channel);
            consumer.Received += async (model, ea) =>
            {
                var body = ea.Body.ToArray();
                var message = Encoding.UTF8.GetString(body);
                var email = JsonSerializer.Deserialize<EmailMessage>(message);

                if (email != null)
                {
                    await emailService.SendAsync(email.To, email.Subject, email.Body);
                }
            };

            channel.BasicConsume(queue: queueName, autoAck: true, consumer: consumer);
        }

        private class EmailMessage
        {
            public string To { get; set; } = string.Empty;
            public string Subject { get; set; } = string.Empty;
            public string Body { get; set; } = string.Empty;
        }
    }
}