public class CommentDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid PostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public DateTime UpdatedAt { get; set; }

    public string UserName { get; set; } = string.Empty;
    public string UserSurname { get; set; } = string.Empty;
}