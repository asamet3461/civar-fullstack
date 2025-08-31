
using System;
using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Events
{
    public class CreateEventDto
    {
        
        public Guid NeighborhoodId { get; set; }

       
        public string Title { get; set; } = string.Empty;

      
        public string Description { get; set; } = string.Empty;

       
        public DateTime StartTime { get; set; }

       
        public DateTime EndTime { get; set; }

        
        public string? Location { get; set; }


    }
}