using System.Collections.Generic;
using System.Threading.Tasks;
using Civar.Application.DTOs.Messages;

namespace Civar.Application.Interfaces
{
    public interface IMessageService
    {
        // Yeni metodlar
        Task<MessageDto> SendPrivateMessageAsync(Guid senderId, SendPrivateMessageDto dto);
        Task<MessageDto> SendNeighborhoodMessageAsync(Guid senderId, SendNeighborhoodMessageDto dto);
        Task<IEnumerable<MessageDto>> GetPrivateMessagesAsync(Guid userId, Guid otherUserId, int page = 1, int pageSize = 50);
        Task<IEnumerable<MessageDto>> GetNeighborhoodMessagesAsync(Guid neighborhoodId, Guid userId, int page = 1, int pageSize = 50);
        Task MarkAsReadAsync(Guid userId, Guid messageId);
        Task DeleteMessageAsync(Guid userId, Guid messageId);
        
        // Eski metodlar - geriye uyumluluk için
        Task<MessageDto> SendMessageAsync(SendMessageDto dto);
        Task<IEnumerable<MessageDto>> GetMessagesForUserAsync(Guid userId);
        Task<MessageDto?> GetMessageByIdAsync(Guid messageId);
        Task MarkAsReadAsync(MarkMessageAsReadDto dto);
    }
}