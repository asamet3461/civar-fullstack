using System;
using System.Collections.Generic;

namespace Civar.Domain.Entities
{
    public class Event : BaseEntity
    {
        public Guid NeighborhoodId { get; private set; }
        public Neighborhood Neighborhood { get; set; }
        public Guid UserId { get; private set; }
        public User User { get; set; }

        public string Title { get; private set; } = string.Empty;
        public string Description { get; private set; } = string.Empty;
        public DateTime StartTime { get; private set; }
        public DateTime EndTime { get; private set; }
        public string Location { get; private set; } = string.Empty;

        public ICollection<EventRSVP> RSVPs { get; private set; }
        public ICollection<Notification> Notifications { get; private set; }

        protected Event()
        {
            RSVPs = new List<EventRSVP>();
            Notifications = new List<Notification>();
        }

        public Event(Guid neighborhoodId, Guid userId, string title, string description, DateTime startTime, DateTime endTime, string location)
        {
            NeighborhoodId = neighborhoodId;
            UserId = userId;
            Title = title;
            Description = description;
            StartTime = startTime;
            EndTime = endTime;
            Location = location;

            RSVPs = new List<EventRSVP>();
            Notifications = new List<Notification>();
        }

        public void UpdateEvent(string title, string description, DateTime startTime, DateTime endTime, string location)
        {
            Title = title;
            Description = description;
            StartTime = startTime;
            EndTime = endTime;
            Location = location;
        }
    }
}