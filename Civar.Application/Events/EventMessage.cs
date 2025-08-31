namespace Civar.Application.Events
{
    public class EventMessage
    {
        public string EventId { get; set; } = string.Empty;
        public string NeighborhoodId { get; set; } = string.Empty;
        public string Title { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string Location { get; set; } = string.Empty;
    }
}