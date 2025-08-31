using System;
using System.Threading.Tasks;

namespace Civar.Application.Interfaces
{
    public interface IUserActivityService
    {
        Task UpdateLastSeenAsync(Guid userId);
        Task<(bool isOnline, DateTime? lastSeen)> GetUserStatusAsync(Guid userId);
        Task MarkOfflineAsync(Guid userId);
    }
}