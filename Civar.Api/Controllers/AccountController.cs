using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Civar.Domain.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization; 
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IConfiguration _configuration;

    public AccountController(UserManager<ApplicationUser> userManager, IConfiguration configuration)
    {
        _userManager = userManager;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpGet("login/{provider}")]
    public IActionResult Login(string provider, string returnUrl = "/")
    {
        var redirectUrl = Url.Action("ExternalLoginCallback", "Account", new { ReturnUrl = returnUrl }, Request.Scheme);
        var properties = new AuthenticationProperties { RedirectUri = redirectUrl };
        return Challenge(properties, provider);
    }

    [AllowAnonymous]
    [HttpGet("externallogincallback")]
    public async Task<IActionResult> ExternalLoginCallback(string returnUrl = "/")
    {
        var authenticateResult = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        if (!authenticateResult.Succeeded)
            return RedirectToAction("Login", new { provider = "Google", returnUrl });

        var email = authenticateResult.Principal.FindFirst(ClaimTypes.Email)?.Value;
        var name = authenticateResult.Principal.FindFirst(ClaimTypes.Name)?.Value;

        Console.WriteLine($"Google'dan gelen email: {email}");

        var allUsers = await _userManager.Users.ToListAsync();
        Console.WriteLine($"Veritabanındaki toplam kullanıcı sayısı: {allUsers.Count}");
        foreach (var dbUser in allUsers)
        {
            Console.WriteLine($"Db: {dbUser.Id} - {dbUser.Email} - {dbUser.NormalizedEmail}");
        }

  
        var user = await _userManager.FindByEmailAsync(email);
        Console.WriteLine($"FindByEmailAsync sonucu: {(user != null ? user.Email : "NULL")}");

     
        var manualUser = await _userManager.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());
        Console.WriteLine($"Elle arama sonucu: {(manualUser != null ? manualUser.Email : "NULL")}");

        if (string.IsNullOrEmpty(email))
            return BadRequest("Email bilgisi alınamadı.");

      
        user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
    
            var registerUrl = QueryHelpers.AddQueryString("http://localhost:3000/register", new Dictionary<string, string?>
    {
        { "email", email },
        { "fullName", name },
        { "returnUrl", returnUrl }
    });
            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);
            return Redirect(registerUrl);
        }


        var claims = new List<Claim>
{
    new Claim(JwtRegisteredClaimNames.Sub, user.Id),
    new Claim(JwtRegisteredClaimNames.Email, user.Email),
    new Claim(ClaimTypes.Name, user.UserName)
};

        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings["Key"]));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"],
            audience: jwtSettings["Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(Convert.ToDouble(jwtSettings["DurationInMinutes"] ?? "60")),
            signingCredentials: creds
        );

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

        await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

        var destination = string.IsNullOrWhiteSpace(returnUrl) ? "/" : returnUrl;
        var redirectWithToken = QueryHelpers.AddQueryString(destination, "token", tokenString);

        return Redirect(redirectWithToken);
    }
}