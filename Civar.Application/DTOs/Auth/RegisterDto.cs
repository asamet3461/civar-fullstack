namespace Civar.Application.DTOs.Auth
{
    public class RegisterDto
    {

        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public bool IsGoogleUser { get; set; }
        public string CityName { get; set; } = string.Empty;
        public string DistrictName { get; set; } = string.Empty;
        public Guid? NeighborhoodId { get; set; }
        public string? NewNeighborhoodName { get; set; }
        public string Address { get; set; } = string.Empty;
        public string? VerificationCode { get; set; }
    }
}