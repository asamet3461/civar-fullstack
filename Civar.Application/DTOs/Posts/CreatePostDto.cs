
using Civar.Domain.Entities; 

namespace Civar.Application.DTOs.Posts
{
    public class CreatePostDto
    {
  
        public Guid NeighborhoodId { get; set; }


        public string Title { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string Content { get; set; } = string.Empty;

       
        public string? Location { get; set; }

      
        public Post.PostType Type { get; set; }
    }
}