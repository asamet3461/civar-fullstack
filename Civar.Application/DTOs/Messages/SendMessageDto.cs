using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Messages
{
    public class SendMessageDto
    {
       
        public Guid SenderId { get; set; }

        
        public Guid ReceiverId { get; set; }

        public string Content { get; set; } = string.Empty;
    }
}