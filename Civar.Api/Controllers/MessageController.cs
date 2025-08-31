using System.Security.Claims;
using Civar.Api.Hubs;
using Civar.Application.DTOs.Messages;
using Civar.Application.Interfaces;
using Civar.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Civar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IHubContext<MessageHub> _hubContext;
        private readonly DatabaseContext _context;

        public MessageController(IMessageService messageService, IHubContext<MessageHub> hubContext, DatabaseContext context)
        {
            _messageService = messageService;
            _hubContext = hubContext;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Send([FromBody] SendMessageDto dto)
        {
            var message = await _messageService.SendMessageAsync(dto);
            await _hubContext.Clients.User(dto.ReceiverId.ToString()).SendAsync("ReceiveMessage", message);
            return Ok(message);
        }

        [HttpPost("neighborhood")]
        public async Task<IActionResult> SendNeighborhoodMessage([FromBody] SendNeighborhoodMessageDto dto)
        {
            var userId = GetUserIdFromContext();
            var message = await _messageService.SendNeighborhoodMessageAsync(userId, dto);
            return Ok(message);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetMessagesForUser(Guid userId)
        {
            var messages = await _messageService.GetMessagesForUserAsync(userId);
            return Ok(messages);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var message = await _messageService.GetMessageByIdAsync(id);
            if (message == null)
                return NotFound();
            return Ok(message);
        }

        [HttpPut("read")]
        public async Task<IActionResult> MarkAsRead([FromBody] MarkMessageAsReadDto dto)
        {
            await _messageService.MarkAsReadAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var userId = GetUserIdFromContext();
            await _messageService.DeleteMessageAsync(userId, id);
            return NoContent();
        }


        [HttpGet("notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = GetUserIdFromContext();
            var notifications = await _context.Notifications
                .Include(n => n.User)
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Type,
                    n.NotificationText,
                    n.IsRead,
                    n.CreatedAt,
                    n.SenderId,
                    n.ReceiverId,
                    n.MessageId,
                    n.PostId,
                    n.EventId,
                    n.CommentId,
                    n.NeighborhoodId
                })
                .ToListAsync();
            return Ok(notifications);
        }


        [HttpGet("notifications/unread")]
        public async Task<IActionResult> GetMyUnreadNotifications()
        {
            var userId = GetUserIdFromContext();
            var notifications = await _context.Notifications
                .Include(n => n.User)
                .Where(n => n.UserId == userId && !n.IsRead)
                .OrderByDescending(n => n.CreatedAt)
                .Select(n => new
                {
                    n.Id,
                    n.Type,
                    n.NotificationText,
                    n.IsRead,
                    n.CreatedAt,
                    n.SenderId,
                    n.ReceiverId,
                    n.MessageId,
                    n.PostId,
                    n.EventId,
                    n.CommentId,
                    n.NeighborhoodId
                })
                .ToListAsync();
            return Ok(notifications);
        }


        [HttpPut("notifications/{notificationId}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(Guid notificationId)
        {
            var userId = GetUserIdFromContext();
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return NotFound();

            notification.MarkAsRead();
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private Guid GetUserIdFromContext()
        {
            var claim = User.FindFirst("domainuserid")?.Value
                       ?? User.FindFirst("userid")?.Value
                       ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                       ?? User.FindFirst("sub")?.Value
                       ?? User.FindFirst("id")?.Value;

            if (Guid.TryParse(claim, out var userId))
                return userId;

            throw new UnauthorizedAccessException("User ID not found in token");
        }

        [HttpGet("neighborhood/{neighborhoodId}")]
        public async Task<IActionResult> GetNeighborhoodMessages(Guid neighborhoodId)
        {
            var userId = GetUserIdFromContext();
            var messages = await _messageService.GetNeighborhoodMessagesAsync(neighborhoodId, userId);
            return Ok(messages);
        }

        [HttpGet("private/{otherUserId}")]
        public async Task<IActionResult> GetPrivateMessages(Guid otherUserId, int page = 1, int pageSize = 50)
        {
            var currentUserId = GetUserIdFromContext();
            var messages = await _messageService.GetPrivateMessagesAsync(currentUserId, otherUserId, page, pageSize);
            return Ok(messages);
        }
    }
}