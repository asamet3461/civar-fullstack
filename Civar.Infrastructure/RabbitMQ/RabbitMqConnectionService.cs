using System;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

namespace Civar.Infrastructure.RabbitMQ
{
    public class RabbitMqConnectionService
    {
        private readonly IConnection _connection;
        private readonly IModel _channel;

        public RabbitMqConnectionService()
        {
            var hostName = Environment.GetEnvironmentVariable("RabbitMQ__Host") ?? "rabbitmq";
            var userName = Environment.GetEnvironmentVariable("RabbitMQ__User") ?? "guest";
            var password = Environment.GetEnvironmentVariable("RabbitMQ__Pass") ?? "guest";
            var vhost = Environment.GetEnvironmentVariable("RabbitMQ__VHost") ?? "ajrpcmix";
            var factory = new ConnectionFactory()
            {
                HostName = hostName,
                UserName = userName,
                Password = password,
                VirtualHost = vhost
            };

            int maxRetries = 10;
            int delayMs = 2000;
            for (int i = 0; i < maxRetries; i++)
            {
                try
                {
                    Console.WriteLine($"RabbitMQ host: {hostName}, user: {userName}, pass: {password}, vhost: {vhost}, try {i + 1}/{maxRetries}");
                    _connection = factory.CreateConnection();
                    _channel = _connection.CreateModel();
                    return;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"RabbitMQ connection attempt {i + 1} failed: {ex.Message}");
                    if (i == maxRetries - 1)
                        throw;
                    Thread.Sleep(delayMs);
                }
            }
        }

        public IModel GetChannel() => _channel;
    }
}