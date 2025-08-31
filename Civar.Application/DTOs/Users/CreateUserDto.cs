using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Users
{
    public class CreateUserDto
    {
        
        public string Name { get; set; } = string.Empty;

       
        public string Surname { get; set; } = string.Empty;

        public string ProfilePictureUrl { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;

       
        public string Password { get; set; } = string.Empty;

       
        public string PhoneNumber { get; set; } = string.Empty;

        
        public Guid NeighborhoodId { get; set; }
    }
}