using System.Collections.Generic;

namespace Civar.Domain.Entities
{
    public class Neighborhood : BaseEntity
    {
        public string Neighbourhood { get; private set; } = string.Empty;
        public string District { get; private set; } = string.Empty;
        public string City { get; private set; } = string.Empty;
        public string Name => Neighbourhood;

        public ICollection<User> Users { get; private set; }
        public ICollection<Post> Posts { get; private set; }
        public ICollection<Notification> Notifications { get; private set; }
        public ICollection<Event> Events { get; private set; }

        protected Neighborhood()
        {
            Users = new List<User>();
            Posts = new List<Post>();
            Notifications = new List<Notification>();
            Events = new List<Event>();
        }

        public Neighborhood(string neighbourhood, string district, string city)
        {
            Neighbourhood = neighbourhood;
            District = district;
            City = city;

            Users = new List<User>();
            Posts = new List<Post>();
            Notifications = new List<Notification>();
            Events = new List<Event>();
        }
    }
}