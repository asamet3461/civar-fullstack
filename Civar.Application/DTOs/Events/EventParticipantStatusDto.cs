using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Civar.Application.DTOs.Events
{
    public class EventParticipantStatusDto
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string? UserRSVPStatus { get; set; } 
    }
}
