using Civar.Application.DTOs.Auth;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System.Linq;
using System;
using System.Collections.Generic;
using Civar.Application.DTOs.Users;

namespace Civar.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly INeighborhoodRepository _neighborhoodRepository;
        private readonly ITemporaryCodeService _codeService;

        public AuthService(UserManager<ApplicationUser> userManager,
                          SignInManager<ApplicationUser> signInManager,
                          IConfiguration configuration,
                          IUserRepository userRepository,
                          IUnitOfWork unitOfWork,
                          INeighborhoodRepository neighborhoodRepository,
                          ITemporaryCodeService codeService)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _configuration = configuration;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _neighborhoodRepository = neighborhoodRepository;
            _codeService = codeService;
        }

        public async Task<(bool Succeeded, string[] Errors)> RegisterAsync(RegisterDto registerDto)
        {
           
            var codeKey = $"verify:{registerDto.Email}";
            var isValid = await _codeService.ValidateCodeAsync(codeKey, registerDto.VerificationCode);
            if (!isValid)
                return (false, new[] { "E-posta doğrulama kodu yanlış veya süresi doldu." });

            
            await _codeService.DeleteCodeAsync(codeKey);

            if (registerDto.Password != registerDto.ConfirmPassword)
            {
                return (false, new[] { "Şifreler eşleşmiyor." });
            }

            var userGuid = Guid.NewGuid();

            var applicationUser = new ApplicationUser
            {
                Id = userGuid.ToString(), 
                UserName = registerDto.Email,
                Email = registerDto.Email
            };

            var result = await _userManager.CreateAsync(applicationUser, registerDto.Password);

            if (!result.Succeeded)
            {
                return (false, result.Errors.Select(e => e.Description).ToArray());
            }

        
            var roleResult = await _userManager.AddToRoleAsync(applicationUser, "User");
            if (!roleResult.Succeeded)
            {
                return (false, roleResult.Errors.Select(e => e.Description).ToArray());
            }

            Neighborhood? neighborhood = null;
            if (registerDto.NeighborhoodId.HasValue)
            {
                neighborhood = await _neighborhoodRepository.GetByIdAsync(registerDto.NeighborhoodId.Value);
                if (neighborhood == null)
                    return (false, new[] { "Seçili mahalle bulunamadı." });
            }
            else if (!string.IsNullOrWhiteSpace(registerDto.NewNeighborhoodName))
            {
          
                neighborhood = await _neighborhoodRepository.GetByDetailsAsync(
                    registerDto.NewNeighborhoodName,
                    registerDto.DistrictName,
                    registerDto.CityName
                );
                if (neighborhood == null)
                {
                    neighborhood = new Neighborhood(
                        registerDto.NewNeighborhoodName,
                        registerDto.DistrictName,
                        registerDto.CityName
                    );
                    await _neighborhoodRepository.AddAsync(neighborhood);
                    await _unitOfWork.SaveChangesAsync();
                }
            }
            else
            {
                return (false, new[] { "Mahalle seçilmeli veya girilmeli." });
            }

       
            var domainUser = new User(
                name: registerDto.Name ?? string.Empty,
                surname: registerDto.Surname ?? string.Empty,
                email: registerDto.Email ?? string.Empty,
                applicationUserId: applicationUser.Id,
                phoneNumber: registerDto.PhoneNumber ?? string.Empty,
                neighborhoodId: neighborhood.Id
            )
            {
                Id = userGuid,
                Address = registerDto.Address
            };

            await _userRepository.AddAsync(domainUser);
            await _unitOfWork.SaveChangesAsync();
            return (true, Array.Empty<string>());
        }

        public async Task<(bool Succeeded, string Token)> LoginAsync(LoginDto loginDto)
        {
            var user = await _userManager.FindByEmailAsync(loginDto.Email);
            if (user == null)
            {
                return (false, "Geçersiz e-posta veya şifre.");
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDto.Password, true);

            if (result.Succeeded)
            {
         
                var domainUser = _userRepository.GetAll()
                    .FirstOrDefault(u => u.ApplicationUserId == user.Id);

                var jwtSettings = _configuration.GetSection("JwtSettings");
                var keyString = jwtSettings["Key"] ?? throw new InvalidOperationException("JWT Key not found.");
                var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer not found.");
                var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience not found.");
                var duration = double.Parse(jwtSettings["DurationInMinutes"] ?? throw new InvalidOperationException("JWT Duration not found."));

                var roles = await _userManager.GetRolesAsync(user);

                var claims = new List<Claim>
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim("applicationuserid", user.Id.ToString()),
                    new Claim("email", user.Email ?? string.Empty),
                    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
                    new Claim(ClaimTypes.Name, user.UserName ?? string.Empty)
                };

                if (domainUser != null)
                {
                    claims.Add(new Claim("domainuserid", domainUser.Id.ToString()));
                    claims.Add(new Claim("userid", domainUser.Id.ToString()));
                }

                foreach (var role in roles)
                {
                    claims.Add(new Claim(ClaimTypes.Role, role));
                }

                var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
                var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: issuer,
                    audience: audience,
                    claims: claims,
                    expires: DateTime.Now.AddMinutes(duration),
                    signingCredentials: creds
                );

                return (true, new JwtSecurityTokenHandler().WriteToken(token));
            }

            if (result.IsLockedOut)
            {
                return (false, "Hesabınız çok fazla başarısız deneme nedeniyle kilitlenmiştir. Lütfen daha sonra tekrar deneyin.");
            }

            return (false, "Geçersiz e-posta veya şifre.");
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var allUsers = await Task.Run(() => _userRepository.GetAll().ToList());
            var user = allUsers.FirstOrDefault(u => u.ApplicationUserId == userId.ToString());
            if (user == null)
                return null; 

            return new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Surname = user.Surname,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address,
                Bio = user.Bio,
                ProfilePictureUrl = user.ProfilePicture,
                IsVerified = user.IsVerified,
                IsActive = user.IsActive,
                NeighborhoodId = user.NeighborhoodId
            };
        }

        public async Task<(bool Succeeded, string[] Errors)> ResetPasswordAsync(string email, string newPassword)
        {
          
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                return (false, new[] { "Kullanıcı bulunamadı." });

          
            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);

           
            var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

            if (result.Succeeded)
                return (true, Array.Empty<string>());
            else
                return (false, result.Errors.Select(e => e.Description).ToArray());
        }
    }
}
