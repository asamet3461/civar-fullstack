namespace Civar.Application.DTOs.Messages
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid SenderId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string SenderAvatar { get; set; } = string.Empty;

        public Guid? ReceiverId { get; set; }
        public string? ReceiverName { get; set; }

        public Guid? NeighborhoodId { get; set; }
        public string? NeighborhoodName { get; set; }

        public string Content { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; 

        public bool IsRead { get; set; }
        public DateTime? ReadAt { get; set; }
        public DateTime CreatedAt { get; set; }

        public bool IsMine { get; set; } 
    }
}