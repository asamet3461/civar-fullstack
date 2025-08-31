using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Users 
{
    public class UpdateUserProfileDto
    {

        public string Name { get; set; } = string.Empty;

  
        public string Surname { get; set; } = string.Empty;

        public string ProfilePictureUrl { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;

       
        public string Bio { get; set; } = string.Empty;
    }
}