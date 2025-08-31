using System.Collections.Generic;
using Civar.Domain.Entities;

namespace Civar.Domain.Entities
{
    
    public class Post : BaseEntity
    {
        public Post() 
        {
            Comments = new List<Comment>();
            Notifications = new List<Notification>();
            Neighborhood = null!; 
            User = null!;         
            Title = string.Empty; 
            Content = string.Empty; 
            Location = string.Empty; 
        }
        public enum PostType
        {
            General = 0,
            Alert = 1,
            ServiceRequest = 2,
            LostAndFound = 3,
            Event = 4,
            ForSale = 5,
            Recommendation = 6,
            SuspiciousActivity = 7,
        }

     
        public Guid UserId { get; private set; }
        public User User { get; set; }
        public Guid NeighborhoodId { get; private set; }
        public Neighborhood Neighborhood { get; set; }


        public string Title { get; set; }
        public string Content { get; set; }
        public string Location { get; set; }

  
        public Post.PostType Type { get; private set; }

       
        public DateTime UpdatedAt { get; private set; }

 
        public bool IsActive { get; set; }

    
        public ICollection<Comment> Comments { get; private set; }
        public ICollection<Notification> Notifications { get; private set; }

       
        public Post(Guid neighborhoodId, Guid userId, string title, string content, string location, PostType type)
        {
            NeighborhoodId = neighborhoodId;
            UserId = userId;
            Title = title;
            Content = content;
            Location = location;
            Type = type;
            IsActive = true;
            UpdatedAt = DateTime.UtcNow;

            Comments = new List<Comment>();
            Notifications = new List<Notification>();
        }

     
        public void UpdatePost(string title, string content, string location)
        {
            Title = title;
            Content = content;
            Location = location;
            UpdatedAt = DateTime.UtcNow;
        }

        public void Deactivate()
        {
            IsActive = false;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}