using System;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using Civar.Application.Interfaces;
using Civar.Application.DTOs.Messages;
using System.Linq;

namespace Civar.Api.Hubs
{
    [Authorize]
    public class MessageHub : Hub
    {
        private readonly IMessageService _messageService;
        private readonly IUserService _userService;
        private readonly ILogger<MessageHub> _logger;

        public MessageHub(
            IMessageService messageService,
            IUserService userService,
            ILogger<MessageHub> logger)
        {
            _messageService = messageService;
            _userService = userService;
            _logger = logger;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
       
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user-{userId.Value}");

            
                var user = await _userService.GetByIdAsync(userId.Value);
                if (user?.NeighborhoodId.HasValue == true)
                {
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"neighborhood-{user.NeighborhoodId.Value}");
                    _logger.LogInformation("User {UserId} added to neighborhood group {NeighborhoodId}",
                        userId.Value, user.NeighborhoodId.Value);
                }
                else
                {
                    _logger.LogWarning("User {UserId} has no neighborhood assigned", userId.Value);
                }

                _logger.LogInformation("User {UserId} connected with connection {ConnectionId}",
                    userId.Value, Context.ConnectionId);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = GetCurrentUserId();
            if (userId.HasValue)
            {
                _logger.LogInformation("User {UserId} disconnected from connection {ConnectionId}",
                    userId.Value, Context.ConnectionId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task SendPrivateMessage(Guid receiverId, string content)
        {
            try
            {
                var senderId = GetCurrentUserId();
                if (!senderId.HasValue) throw new HubException("Unauthorized");

                var dto = new SendPrivateMessageDto
                {
                    ReceiverId = receiverId,
                    Content = content
                };

                var message = await _messageService.SendPrivateMessageAsync(senderId.Value, dto);

                await Clients.Group($"user-{receiverId}").SendAsync("ReceivePrivateMessage", message);

                await Clients.Group($"user-{senderId.Value}").SendAsync("ReceivePrivateMessage", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending private message");
                await Clients.Caller.SendAsync("MessageError", "Mesaj gönderilemedi: " + ex.Message);
            }
        }

        public async Task SendNeighborhoodMessage(Guid neighborhoodId, string content)
        {
            try
            {
                var senderId = GetCurrentUserId();
                if (!senderId.HasValue) throw new HubException("Unauthorized");

    
                var user = await _userService.GetByIdAsync(senderId.Value);
                _logger.LogInformation("User {UserId} trying to send message to neighborhood {NeighborhoodId}. User's neighborhood: {UserNeighborhoodId}",
                    senderId.Value, neighborhoodId, user?.NeighborhoodId);

                if (user?.NeighborhoodId != neighborhoodId)
                {
                    _logger.LogWarning("User {UserId} (neighborhood: {UserNeighborhoodId}) unauthorized to send to neighborhood {NeighborhoodId}",
                        senderId.Value, user?.NeighborhoodId, neighborhoodId);
                    throw new HubException("Bu mahalleye mesaj gönderme yetkiniz yok");
                }

                var dto = new SendNeighborhoodMessageDto
                {
                    NeighborhoodId = neighborhoodId,
                    Content = content
                };

                var message = await _messageService.SendNeighborhoodMessageAsync(senderId.Value, dto);

                await Clients.Group($"neighborhood-{neighborhoodId}").SendAsync("ReceiveNeighborhoodMessage", message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending neighborhood message");
                await Clients.Caller.SendAsync("MessageError", "Mahalle mesajı gönderilemedi: " + ex.Message);
            }
        }

        public async Task MarkMessageAsRead(Guid messageId)
        {
            try
            {
                var userId = GetCurrentUserId();
                if (!userId.HasValue) throw new HubException("Unauthorized");

                await _messageService.MarkAsReadAsync(userId.Value, messageId);

                await Clients.Caller.SendAsync("MessageMarkedAsRead", messageId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error marking message as read");
            }
        }

        private Guid? GetCurrentUserId()
        {
      
            if (Context.User?.Claims != null)
            {
                _logger.LogInformation("User claims found: {Claims}",
                    string.Join(", ", Context.User.Claims.Select(c => $"{c.Type}={c.Value}")));
            }
            else
            {
                _logger.LogWarning("No user claims found in context");
            }

            var claim = Context.User?.FindFirst("domainuserid")
                       ?? Context.User?.FindFirst("userid")
                       ?? Context.User?.FindFirst(ClaimTypes.NameIdentifier)
                       ?? Context.User?.FindFirst("sub")
                       ?? Context.User?.FindFirst("id");

            if (claim == null)
            {
                _logger.LogWarning("No user ID claim found in JWT token");
                return null;
            }

            _logger.LogInformation("Found user ID claim: {ClaimType} = {ClaimValue}", claim.Type, claim.Value);

            if (Guid.TryParse(claim.Value, out var id))
            {
                _logger.LogInformation("Successfully parsed user ID: {UserId}", id);
                return id;
            }
            else
            {
                _logger.LogWarning("Failed to parse user ID from claim value: {ClaimValue}", claim.Value);
                return null;
            }
        }
    }
}