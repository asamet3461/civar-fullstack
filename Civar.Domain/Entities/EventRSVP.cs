using System.ComponentModel.DataAnnotations;
using Civar.Domain.Entities;
using System.Collections.Generic;

namespace Civar.Domain.Entities
{
    public class EventRSVP : BaseEntity
    {
        public enum EventStatus
        {
            [Display(Name = "Katılıyor")]
            Attending,
            [Display(Name = "İlgileniyor")]
            Interested,
            [Display(Name = "Reddetti")]
            Declined
        }

        public Guid UserId { get; private set; }
        public User User { get; set; } = null!;
        public Guid EventId { get; set; }
        public Event Event { get; set; } = null!;

        public EventStatus Status { get; set; }
        public ICollection<Notification> Notifications { get; private set; } = new List<Notification>();

        protected EventRSVP() { }

        public EventRSVP(Guid userId, Guid eventId, EventStatus status)
        {
            UserId = userId;
            EventId = eventId;
            Status = status;
        }

        public void UpdateStatus(EventStatus newStatus)
        {
            Status = newStatus;
        }
    }
}