namespace Civar.Application.DTOs.Neighborhoods
{
    public class NeighborhoodDto
    {
        public Guid Id { get; set; }
        public string Neighbourhood { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
    }
}