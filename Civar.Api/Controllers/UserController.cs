using System.Security.Claims;
using Civar.Application.DTOs.Users;
using Civar.Application.Interfaces;
using Civar.Infrastructure.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Civar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IUserActivityService _userActivityService;

        public UserController(IUserService userService, IUserActivityService userActivityService)
        {
            _userService = userService;
            _userActivityService = userActivityService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? neighborhoodId)
        {
            var users = await _userService.GetAllUsersAsync(neighborhoodId);
            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
                return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateUserDto dto)
        {
            var createdUser = await _userService.CreateUserAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = createdUser.Id }, createdUser);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProfile(Guid id, [FromBody] UpdateUserProfileDto dto)
        {
            var result = await _userService.UpdateUserProfileAsync(id, dto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{id}/password")]
        public async Task<IActionResult> UpdatePassword(Guid id, [FromBody] UpdatePasswordDto dto)
        {
            var result = await _userService.UpdatePasswordAsync(id, dto);
            if (!result)
                return BadRequest("Password update failed.");
            return NoContent();
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> AdminUpdateStatus(Guid id, [FromBody] AdminUpdateUserStatusDto dto)
        {
            var result = await _userService.AdminUpdateUserStatusAsync(id, dto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPut("{id}/profile-picture")]
        public async Task<IActionResult> UpdateProfilePicture(Guid id, [FromForm] UpdateProfilePictureDto dto)
        {
            var result = await _userService.UpdateProfilePictureAsync(id, dto);
            if (!result)
                return BadRequest("Profile picture update failed.");
            return NoContent();
        }

        [HttpPut("{id}/neighborhood")]
        public async Task<IActionResult> UpdateNeighborhood(Guid id, [FromBody] UpdateUserNeighborhoodDto dto)
        {
            var result = await _userService.UpdateUserNeighborhoodAsync(id, dto.NeighborhoodId);
            if (!result)
                return NotFound();
            return NoContent();
        }
        [Authorize]
        [HttpPost("activity")]
        public async Task<IActionResult> GetUsersActivity([FromBody] List<Guid> userIds)
        {
            var result = new List<object>();
            foreach (var userId in userIds)
            {
                var (isOnline, lastSeen) = await _userActivityService.GetUserStatusAsync(userId);
                result.Add(new { userId, isOnline, lastSeen });
            }
            return Ok(result);
        }
        [Authorize]
        [HttpPost("activity/mark-offline")]
        public async Task<IActionResult> MarkOffline()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!Guid.TryParse(userIdStr, out var guid))
                return BadRequest();

            await _userActivityService.MarkOfflineAsync(guid);
            return NoContent();
        }
    }
}
