using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Civar.Application.Interfaces
{
    public interface IEmailNotificationService
    {
        void SendNotification(string to, string subject, string body);
    }
}
