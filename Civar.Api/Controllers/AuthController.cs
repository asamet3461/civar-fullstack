using Civar.Application.DTOs.Auth;
using Civar.Application.Interfaces;
using Civar.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StackExchange.Redis;
using System.Security.Claims;
using System.Threading.Tasks;

namespace Civar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IEmailService _emailService;
        private readonly TemporaryCodeService _codeService;

        public AuthController(
            IAuthService authService,
            IEmailService emailService,
            TemporaryCodeService codeService)
        {
            _authService = authService;
            _emailService = emailService;
            _codeService = codeService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {

            if (!registerDto.IsGoogleUser && string.IsNullOrWhiteSpace(registerDto.VerificationCode))
            {
                return BadRequest(new { Errors = new[] { "VerificationCode zorunlu." } });
            }

            var (succeeded, errors) = await _authService.RegisterAsync(registerDto);

            if (!succeeded)
            {
                return BadRequest(new { Errors = errors });
            }

            var (loginSuccess, token) = await _authService.LoginAsync(new LoginDto
            {
                Email = registerDto.Email,
                Password = registerDto.Password
            });

            if (!loginSuccess)
            {
                return BadRequest(new { Message = "Kayıt başarılı, ancak otomatik giriş başarısız." });
            }

            return Ok(new { Token = token });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            var (succeeded, token) = await _authService.LoginAsync(loginDto);

            if (!succeeded)
            {
                return BadRequest(new { Message = token });
            }

            return Ok(new { Token = token });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userIdString == null)
                return Unauthorized(new { Message = "User ID not found in token" });

            if (!Guid.TryParse(userIdString, out var userId))
            {
                return BadRequest(new { Message = "Invalid user ID format" });
            }

            var user = await _authService.GetUserByIdAsync(userId);
            if (user == null)
                return NotFound(new { Message = "Kullanıcı bulunamadı." });

            return Ok(new
            {
                id = user.Id,
                name = user.Name,
                surname = user.Surname,
                email = user.Email,
                neighborhoodId = user.NeighborhoodId,
                username = $"{user.Name} {user.Surname}",
                profilePictureUrl = user.ProfilePictureUrl // <-- Bunu ekle
            });
        }

        [HttpPost("send-verification-code")]
        public async Task<IActionResult> SendVerificationCode([FromBody] SendVerificationCodeDto dto)
        {
            if (dto.IsGoogleUser)
                return BadRequest(new { Message = "Google ile giriş yapan kullanıcıya doğrulama kodu gönderilmez." });

            var key = $"ratelimit:verify:{dto.Email}";
            var count = await _codeService.IncrementRateLimitAsync(key, TimeSpan.FromMinutes(1));
            if (count > 3)
                return BadRequest(new { Message = "Çok fazla kod gönderdiniz. Lütfen daha sonra tekrar deneyin." });

            var code = new Random().Next(100000, 999999).ToString();
            await _codeService.SetCodeAsync($"verify:{dto.Email}", code, TimeSpan.FromMinutes(5));
            await _emailService.SendAsync(dto.Email, "Doğrulama Kodunuz", $"Kodunuz: {code}");
            return Ok(new { Message = "Doğrulama kodu e-posta ile gönderildi." });
        }

        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyCode([FromBody] VerifyCodeDto dto)
        {

            var key = $"verify:{dto.Email}";
            Console.WriteLine($"Doğrulama: {key} - {dto.Code}"); 
            var isValid = await _codeService.ValidateCodeAsync(key, dto.Code);
            if (isValid)
            {
                await _codeService.DeleteCodeAsync(key);
                return Ok(new { success = true });
            }
            return BadRequest(new { success = false, message = "Kod yanlış veya süresi doldu." });
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] string email)
        {

            var redis = _codeService.GetType()
                .GetProperty("_redis", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance)
                ?.GetValue(_codeService) as Civar.Infrastructure.Redis.RedisConnectionService;
            var db = redis?.Database;
            var key = $"ratelimit:reset:{email}";
            var count = await db.StringIncrementAsync(key);
            if (count == 1)
                await db.KeyExpireAsync(key, TimeSpan.FromMinutes(1));
            if (count > 3)
                return BadRequest(new { Message = "Çok fazla kod gönderdiniz. Lütfen daha sonra tekrar deneyin." });

            var code = new Random().Next(100000, 999999).ToString();
            await _codeService.SetCodeAsync($"reset:{email}", code, TimeSpan.FromMinutes(5));
            await _emailService.SendAsync(email, "Şifre Sıfırlama Kodunuz", $"Şifre sıfırlama kodunuz: {code}");
            return Ok(new { Message = "Şifre sıfırlama kodu e-posta ile gönderildi." });
        }

        
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            var key = $"reset:{dto.Email}";
            Console.WriteLine($"Doğrulama: {key} - {dto.Code}"); 
            var isValid = await _codeService.ValidateCodeAsync(key, dto.Code);
            if (!isValid)
                return BadRequest(new { success = false, message = "Kod yanlış veya süresi doldu." });

            await _codeService.DeleteCodeAsync(key);
            var (success, errors) = await _authService.ResetPasswordAsync(dto.Email, dto.NewPassword);
            if (!success)
                return BadRequest(new { success = false, errors });

            return Ok(new { success = true, message = "Şifre başarıyla güncellendi." });
        }
    }
}
