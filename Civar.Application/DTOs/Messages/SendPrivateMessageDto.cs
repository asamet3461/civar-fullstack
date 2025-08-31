using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Messages
{
    public class SendPrivateMessageDto
    {
        
        public Guid ReceiverId { get; set; }


        public string Content { get; set; } = string.Empty;
    }
}