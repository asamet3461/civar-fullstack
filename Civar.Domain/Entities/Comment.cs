using System;
using System.Collections.Generic;

namespace Civar.Domain.Entities
{
    public class Comment : BaseEntity
    {
        public Guid UserId { get; private set; }
        public User User { get; set; }
        public Guid PostId { get; private set; }
        public Post Post { get; set; }

        public string Content { get; private set; } = string.Empty;
        public DateTime UpdatedAt { get; private set; }

        public ICollection<Notification> Notifications { get; private set; }

        protected Comment()
        {
            Notifications = new List<Notification>();
            User = null!;
            Post = null!;
        }

        public Comment(Guid userId, Guid postId, string content)
        {
            UserId = userId;
            PostId = postId;
            Content = content;
            UpdatedAt = DateTime.UtcNow;
            Notifications = new List<Notification>();
        }

        public void UpdateContent(string newContent)
        {
            Content = newContent;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}