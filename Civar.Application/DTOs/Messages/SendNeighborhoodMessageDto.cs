using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Messages
{
    public class SendNeighborhoodMessageDto
    {
        [Required(ErrorMessage = "Mahalle ID gereklidir")]
        public Guid NeighborhoodId { get; set; }

        [Required(ErrorMessage = "Mesaj içeriği gereklidir")]
        [StringLength(5000, MinimumLength = 1, ErrorMessage = "Mesaj 1-5000 karakter arasında olmalıdır")]
        public string Content { get; set; } = string.Empty;
    }
}