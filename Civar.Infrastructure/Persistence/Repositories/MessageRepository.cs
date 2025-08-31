using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Persistence;
using Civar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class MessageRepository : GenericRepository<Message>, IMessageRepository
    {
        public MessageRepository(DatabaseContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Message>> GetMessagesByUserIdAsync(Guid userId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Include(m => m.Neighborhood)
                .Where(m => (m.SenderId == userId || m.ReceiverId == userId) && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetPrivateMessagesBetweenUsersAsync(Guid userId1, Guid userId2, int page, int pageSize)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.Type == MessageType.Private &&
                           !m.IsDeleted &&
                           ((m.SenderId == userId1 && m.ReceiverId == userId2) ||
                            (m.SenderId == userId2 && m.ReceiverId == userId1)))
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetNeighborhoodMessagesAsync(Guid neighborhoodId, int page, int pageSize)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Neighborhood)
                .Where(m => m.Type == MessageType.Neighborhood &&
                           m.NeighborhoodId == neighborhoodId &&
                           !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();
        }

        public async Task<IEnumerable<Message>> GetUnreadMessagesForUserAsync(Guid userId)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.ReceiverId == userId && !m.IsRead && !m.IsDeleted)
                .OrderByDescending(m => m.CreatedAt)
                .ToListAsync();
        }
    }
}