using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Messages
{
    public class MarkMessageAsReadDto
    {
        [Required]
        public Guid MessageId { get; set; }
    }
}