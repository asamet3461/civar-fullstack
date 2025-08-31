namespace Civar.Application.DTOs.Users
{
    public class AdminUpdateUserStatusDto
    {
        public bool IsActive { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsVerified { get; set; }
    }
}