using Civar.Domain.Entities;

public class PostDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public Post.PostType Type { get; set; }

    public DateTime CreatedAt { get; set; } 
    public DateTime UpdatedAt { get; set; }
    public bool IsActive { get; set; }

  
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public Guid NeighborhoodId { get; set; }
    public string Neighborhood { get; set; } = string.Empty;
}