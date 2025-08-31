using Civar.Domain.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Civar.Domain.Interfaces
{
    public interface IMessageRepository : IGenericRepository<Message>
    {
        Task<IEnumerable<Message>> GetMessagesByUserIdAsync(Guid userId);
        Task<IEnumerable<Message>> GetPrivateMessagesBetweenUsersAsync(Guid userId1, Guid userId2, int page, int pageSize);
        Task<IEnumerable<Message>> GetNeighborhoodMessagesAsync(Guid neighborhoodId, int page, int pageSize);
        Task<IEnumerable<Message>> GetUnreadMessagesForUserAsync(Guid userId);
    }
}