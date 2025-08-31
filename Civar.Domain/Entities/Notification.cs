using System;
using System.ComponentModel.DataAnnotations;

namespace Civar.Domain.Entities
{
    public class Notification : BaseEntity
    {
        public enum NotificationType
        {
            [Display(Name = "Mahallede Yeni Gönderi")]
            NewPostInNeighborhood,
            [Display(Name = "Gönderinize Yeni Yorum")]
            NewCommentOnYourPost,
            [Display(Name = "Uyarı")]
            Alert,
            [Display(Name = "Yeni Etkinlik")]
            NewEvent,
            [Display(Name = "Yeni Etkinlik Katılımı")]
            NewEventRSVP,
            [Display(Name = "Yeni Mesaj")]
            NewMessage,
            [Display(Name = "Yeni Komşu Katıldı")]
            NewNeighbor,
            [Display(Name = "Mahalle Sohbetinde Yeni Mesaj")]
            NewNeighborhoodMessage,
            [Display(Name ="Etkinliğe yeni katılım!")]
            NewRSVP
        }

        public Guid UserId { get; private set; }
        public User User { get; set; } = null!;
        public Guid? SenderId { get; set; }
        public Guid? ReceiverId { get; set; }
        public Guid? PostId { get; private set; }
        public Post? Post { get; set; }
        public Guid? EventId { get; private set; }
        public Event? Event { get; set; }
        public Guid? EventRSVPId { get; private set; }
        public EventRSVP? EventRSVP { get; set; }
        public Guid? CommentId { get; private set; }
        public Comment? Comment { get; set; }
        public Guid? MessageId { get; private set; }
        public Message? Message { get; set; }
        public Guid NeighborhoodId { get; private set; }
        public Neighborhood Neighborhood { get; set; } = null!;

        public bool IsRead { get; private set; } = false;
        public NotificationType Type { get; private set; }
        public string NotificationText { get; private set; } = string.Empty;

        protected Notification() { }

        public Notification(Guid userId, NotificationType type, string text, Guid neighborhoodId, Guid? senderId = null, Guid? receiverId = null, Guid? postId = null, Guid? eventId = null, Guid? eventRsvpId = null, Guid? commentId = null, Guid? messageId = null)
        {
            UserId = userId;
            Type = type;
            NotificationText = text;
            NeighborhoodId = neighborhoodId;
            SenderId = senderId;
            ReceiverId = receiverId;
            PostId = postId;
            EventId = eventId;
            EventRSVPId = eventRsvpId;
            CommentId = commentId;
            MessageId = messageId;
            IsRead = false;
        }

        public void MarkAsRead()
        {
            if (!IsRead)
            {
                IsRead = true;
            }
        }
        public void UpdateTextAndStatus(string text, bool isRead = false)
        {
            NotificationText = text;
            IsRead = isRead;
        }
    }
}