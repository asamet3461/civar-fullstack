using System.Collections.Generic;
using System.Threading.Tasks;
using Civar.Application.DTOs;
using Civar.Application.DTOs.Users;
using Civar.Domain.Entities;

namespace Civar.Application.Interfaces
{
    public interface IUserService
    {
        
        Task<UserDto> CreateUserAsync(CreateUserDto userDto);

      
        Task<UserDto?> GetUserByIdAsync(Guid userId);
        Task<UserDto?> GetByIdAsync(Guid userId); 
        Task<UserDto?> GetUserByEmailAsync(string email);
        Task<List<UserDto>> GetAllUsersAsync(Guid? neighborhoodId = null);

 
        Task<bool> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto profileDto);

       
        Task<bool> UpdatePasswordAsync(Guid userId, UpdatePasswordDto passwordDto);

  
        Task<bool> AdminUpdateUserStatusAsync(Guid userId, AdminUpdateUserStatusDto statusDto);

 
        Task<bool> UpdateProfilePictureAsync(Guid userId, UpdateProfilePictureDto pictureDto);

      
        Task<bool> UpdateUserNeighborhoodAsync(Guid userId, Guid neighborhoodId);
    }
}