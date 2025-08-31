using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Users
{
    public class UpdatePasswordDto
    {
       
        public string CurrentPassword { get; set; } = string.Empty;

        
        public string NewPassword { get; set; } = string.Empty;

       
        public string ConfirmNewPassword { get; set; } = string.Empty;
    }
}