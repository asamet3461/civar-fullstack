
using System;
using System.ComponentModel.DataAnnotations;

namespace Civar.Application.DTOs.Events
{
    public class UpdateEventDto
    {
       
        public string Title { get; set; } = string.Empty;

        
        public string Description { get; set; } = string.Empty;

       
        public DateTime StartTime { get; set; }

       
        public DateTime EndTime { get; set; }

        
        public string Location { get; set; } = string.Empty;
    }
}