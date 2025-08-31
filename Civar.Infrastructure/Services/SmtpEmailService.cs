using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Civar.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Civar.Infrastructure.Services
{
    public class SmtpEmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public SmtpEmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendAsync(string to, string subject, string body)
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = int.Parse(_configuration["Smtp:Port"]);
            var smtpUser = _configuration["Smtp:User"];
            var smtpPass = _configuration["Smtp:Pass"];
            var from = _configuration["Smtp:From"];

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(smtpUser, smtpPass),
                EnableSsl = true
            };

            var mail = new MailMessage(from, to, subject, body)
            {
                IsBodyHtml = true
            };

            await client.SendMailAsync(mail);
        }
    }
}