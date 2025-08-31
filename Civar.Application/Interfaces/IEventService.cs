using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Civar.Application.DTOs.Events;
using Civar.Domain.Entities;

namespace Civar.Application.Interfaces
{
    public interface IEventService
    {
        Task<EventDto> CreateEventAsync(CreateEventDto dto, Guid userId);
        Task<bool> UpdateEventAsync(Guid eventId, UpdateEventDto dto);
        Task<bool> DeleteEventAsync(Guid eventId, Guid userId);
        Task<EventDto?> GetEventByIdAsync(Guid eventId);
        Task<List<EventDto>> GetEventsByNeighborhoodAsync(Guid neighborhoodId);
        Task<List<EventDto>> GetEventsByUserIdAsync(Guid userId);
        Task<List<EventDto>> GetUpcomingEventsAsync(int count);
        Task<List<EventDto>> GetPastEventsAsync(int count);
        Task<List<EventDto>> GetEventsUserIsAttendingAsync(Guid userId);
        Task<List<EventDto>> GetEventsInDateRangeAsync(DateTime startDate, DateTime endDate);

        Task<List<EventDto>> GetAllEventsAsync(Guid? neighborhoodId = null);
        Task<bool> AddRSVPAsync(Guid eventId, Guid userId, EventRSVP.EventStatus status);
    }
}