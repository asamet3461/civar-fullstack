using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class EventRepository : GenericRepository<Event>, IEventRepository
    {
        public EventRepository(DatabaseContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Event>> GetEventsByNeighborhoodAsync(Guid neighborhoodId)
        {
            return await _context.Events
                .Where(e => e.NeighborhoodId == neighborhoodId)
                .OrderBy(e => e.StartTime)
                .Include(e => e.User)
                .Include(e => e.Neighborhood)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetEventsByUserIdAsync(Guid userId)
        {
            return await _context.Events
                .Where(e => e.UserId == userId)
                .OrderBy(e => e.CreatedAt)
                .Include(e => e.User)
                .Include(e => e.Neighborhood)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetUpcomingEventsAsync(int count)
        {
            return await _context.Events
                .Where(e => e.StartTime >= DateTime.UtcNow)
                .OrderBy(e => e.StartTime)
                .Take(count)
                .Include(e => e.User)
                .Include(e => e.Neighborhood)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetPastEventsAsync(int count)
        {
            return await _context.Events
                .Where(e => e.EndTime < DateTime.UtcNow)
                .OrderByDescending(e => e.EndTime)
                .Take(count)
                .Include(e => e.User)
                .Include(e => e.Neighborhood)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetEventsUserIsAttendingAsync(Guid userId)
        {
            return await _context.EventRSVPs
                .Where(rsvp => rsvp.UserId == userId)
                .Select(rsvp => rsvp.Event)
                .Include(e => e.User)
                .Include(e => e.Neighborhood)
                .ToListAsync();
        }

        public async Task<IEnumerable<Event>> GetEventsInDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _context.Events
                .Where(e => e.StartTime >= startDate && e.EndTime <= endDate)
                .OrderBy(e => e.StartTime)
                .Include(e => e.User)
                .Include(e => e.Neighborhood)
                .ToListAsync();
        }

        public IQueryable<Event> GetAllWithIncludes()
        {
            return _context.Events
                .Include(e => e.User)
                .Include(e => e.Neighborhood);
        }
        public async Task<Event?> GetByIdWithRSVPsAsync(Guid id)
        {
            return await _context.Events
                .Include(e => e.RSVPs)
                .Include(e => e.Notifications)
                .FirstOrDefaultAsync(e => e.Id == id);
        }
    }
}