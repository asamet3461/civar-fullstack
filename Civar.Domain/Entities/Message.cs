using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Civar.Domain.Entities
{
    public enum MessageType
    {
        Private = 1,
        Neighborhood = 2
    }

    public class Message : BaseEntity
    {
        [Required]
        public Guid SenderId { get; set; }
        public User Sender { get; set; }

      
        public Guid? ReceiverId { get; set; }
        public User? Receiver { get; set; }

      
        public Guid? NeighborhoodId { get; set; }
        public Neighborhood? Neighborhood { get; set; }

        [Required]
        [StringLength(5000)]
        public string Content { get; set; } = string.Empty;

        [Required]
        public MessageType Type { get; set; }

        public bool IsRead { get; set; } = false;
        public DateTime? ReadAt { get; set; }

       
        public bool IsDeleted { get; set; } = false;
        public DateTime? DeletedAt { get; set; }
        public Guid? DeletedBy { get; set; }

        public ICollection<Notification> Notifications { get; set; } = new List<Notification>();

        
        protected Message() { } 

       
        public static Message CreatePrivateMessage(Guid senderId, Guid receiverId, string content)
        {
            return new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = content,
                Type = MessageType.Private,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Notifications = new List<Notification>()
            };
        }

       
        public static Message CreateNeighborhoodMessage(Guid senderId, Guid neighborhoodId, string content)
        {
            return new Message
            {
                SenderId = senderId,
                NeighborhoodId = neighborhoodId,
                Content = content,
                Type = MessageType.Neighborhood,
                IsRead = false,
                CreatedAt = DateTime.UtcNow,
                Notifications = new List<Notification>()
            };
        }

        public void MarkAsRead(Guid? readBy = null)
        {
            if (!IsRead)
            {
                IsRead = true;
                ReadAt = DateTime.UtcNow;
            }
        }

        public void SoftDelete(Guid deletedBy)
        {
            IsDeleted = true;
            DeletedAt = DateTime.UtcNow;
            DeletedBy = deletedBy;
        }
    }
}