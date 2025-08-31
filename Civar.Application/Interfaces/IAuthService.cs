using System.Threading.Tasks;
using Civar.Application.DTOs.Auth;
using Civar.Application.DTOs.Users;

namespace Civar.Application.Interfaces
{
    public interface IAuthService
    {
        Task<(bool Succeeded, string[] Errors)> RegisterAsync(RegisterDto registerDto);
        Task<(bool Succeeded, string Token)> LoginAsync(LoginDto loginDto);
        Task<UserDto> GetUserByIdAsync(Guid userId);
        Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(string email, string newPassword);
    }
}