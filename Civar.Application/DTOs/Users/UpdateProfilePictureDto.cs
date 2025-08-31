using Microsoft.AspNetCore.Http; 
using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Users
{
    public class UpdateProfilePictureDto
    {

        public IFormFile? ProfilePictureFile { get; set; } 
    }
}