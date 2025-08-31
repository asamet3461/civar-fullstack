using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Civar.Domain.Entities;

namespace Civar.Domain.Interfaces
{
    public interface IEventRepository : IGenericRepository<Event>
    {
        Task<IEnumerable<Event>> GetEventsByNeighborhoodAsync(Guid neighborhoodId);
        Task<IEnumerable<Event>> GetEventsByUserIdAsync(Guid userId);
        Task<IEnumerable<Event>> GetUpcomingEventsAsync(int count);
        Task<IEnumerable<Event>> GetPastEventsAsync(int count);
        Task<IEnumerable<Event>> GetEventsUserIsAttendingAsync(Guid userId);
        Task<IEnumerable<Event>> GetEventsInDateRangeAsync(DateTime startDate, DateTime endDate);
        IQueryable<Event> GetAllWithIncludes();
        Task<Event?> GetByIdWithRSVPsAsync(Guid id);
    }
}
