using System;

namespace Civar.Application.DTOs.Events
{
    public class EventDto
    {
        public Guid Id { get; set; }
        public Guid NeighborhoodId { get; set; }
        public string NeighborhoodName { get; set; } = string.Empty;    
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty ;
        public string Description { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Location { get; set; } = string.Empty;
        public int RSVPCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<EventRSVPDto> RSVPs { get; set; }
        public List<EventParticipantStatusDto> Participants { get; set; } 
    }
}