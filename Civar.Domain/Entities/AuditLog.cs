using Civar.Domain.Entities;

public class AuditLog : BaseEntity
{
    public string UserId { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string Details { get; set; } = string.Empty;
}