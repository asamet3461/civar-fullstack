namespace Civar.Application.DTOs.Users
{
    public class UserDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string? Bio { get; set; }
        public string ProfilePictureUrl { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }


        public Guid? NeighborhoodId { get; set; }
        public string? NeighborhoodName { get; set; }
    }
}