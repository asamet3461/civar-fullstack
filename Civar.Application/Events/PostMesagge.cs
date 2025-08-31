namespace Civar.Application.Events
{
    public class PostMessage
    {
        public string PostId { get; set; } = string.Empty;
        public string NeighborhoodId { get; set; } = string.Empty;
        public string UserId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
