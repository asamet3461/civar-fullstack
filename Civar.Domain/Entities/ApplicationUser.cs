using Microsoft.AspNetCore.Identity;

namespace Civar.Domain.Entities
{
    
    public class ApplicationUser : IdentityUser
    {
        public Guid? UserId { get; set; }
        public string? FullName { get; set; }
    }
}