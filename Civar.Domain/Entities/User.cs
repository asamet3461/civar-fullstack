using System;
using System.Collections.Generic;

namespace Civar.Domain.Entities
{
    public class User : BaseEntity
    {
        public string Name { get; private set; } = string.Empty;
        public string Surname { get; private set; } = string.Empty;

        public string FirstName => Name;
        public string LastName => Surname;

        public string Email { get; private set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string ApplicationUserId { get; private set; } = string.Empty;
        public string PhoneNumber { get; private set; } = string.Empty;
        public string Address { get;  set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string ProfilePicture { get; set; } = string.Empty;

        public Guid? NeighborhoodId { get; private set; }
        public Neighborhood Neighborhood { get; set; }

        public DateTime UpdatedAt { get; private set; }
        public bool IsVerified { get; private set; }
        public bool IsActive { get; private set; }
        public bool IsAdmin { get; private set; }

        public ICollection<Post> Posts { get; private set; }
        public ICollection<Comment> Comments { get; private set; }
        public ICollection<Message> SentMessages { get; private set; }
        public ICollection<Message> ReceivedMessages { get; private set; }
        public ICollection<Notification> Notifications { get; private set; }
        public ICollection<EventRSVP> EventRSVPs { get; private set; }
        public ICollection<Event> Events { get; private set; }

        protected User()
        {
            Neighborhood = null!;
            Posts = new List<Post>();
            Comments = new List<Comment>();
            SentMessages = new List<Message>();
            ReceivedMessages = new List<Message>();
            Notifications = new List<Notification>();
            EventRSVPs = new List<EventRSVP>();
            Events = new List<Event>();
        }

        public User(string name, string surname, string email, string applicationUserId, string phoneNumber, Guid? neighborhoodId = null)
        {
            Name = name;
            Surname = surname;
            Email = email;
            ApplicationUserId = applicationUserId;
            PhoneNumber = phoneNumber;
            NeighborhoodId = neighborhoodId;

            IsActive = true;
            IsAdmin = false;
            IsVerified = false;
            UpdatedAt = DateTime.UtcNow;

            Posts = new List<Post>();
            Comments = new List<Comment>();
            SentMessages = new List<Message>();
            ReceivedMessages = new List<Message>();
            Notifications = new List<Notification>();
            EventRSVPs = new List<EventRSVP>();
            Events = new List<Event>();
        }

        public void UpdateProfile(string name, string surname, string phoneNumber, string address, string bio, string profilePicture)
        {
            Name = name;
            Surname = surname;
            PhoneNumber = phoneNumber;
            Address = address;
            Bio = bio;
            ProfilePicture = profilePicture;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateAddress(string newAddress)
        {
            Address = newAddress;
            UpdatedAt = DateTime.UtcNow;
        }

        public void ToggleActivation(bool isActive)
        {
            IsActive = isActive;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetAdminStatus(bool isAdmin)
        {
            IsAdmin = isAdmin;
            UpdatedAt = DateTime.UtcNow;
        }

        public void SetVerificationStatus(bool isVerified)
        {
            IsVerified = isVerified;
            UpdatedAt = DateTime.UtcNow;
        }

        public void UpdateNeighborhood(Guid neighborhoodId)
        {
            NeighborhoodId = neighborhoodId;
            UpdatedAt = DateTime.UtcNow;
        }
    }
}