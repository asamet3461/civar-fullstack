using Civar.Application.DTOs.Events;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Civar.Infrastructure.RabbitMQ;

namespace Civar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;
        private readonly EventPublisher _eventPublisher;

        public EventController(IEventService eventService, EventPublisher eventPublisher)
        {
            _eventService = eventService;
            _eventPublisher = eventPublisher;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? neighborhoodId)
        {
            var events = await _eventService.GetAllEventsAsync(neighborhoodId);
            return Ok(events);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var ev = await _eventService.GetEventByIdAsync(id);
            if (ev == null)
                return NotFound();
            return Ok(ev);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto dto, [FromQuery] Guid userId)
        {
            var createdEvent = await _eventService.CreateEventAsync(dto, userId);

            _eventPublisher.PublishEvent(new Civar.Application.Events.EventMessage
            {
                EventId = createdEvent.Id.ToString(),
                NeighborhoodId = createdEvent.NeighborhoodId.ToString(),
                Title = createdEvent.Title,
                Description = createdEvent.Description,
                StartDate = createdEvent.StartTime,
                EndDate = createdEvent.EndTime,
                Location = createdEvent.Location
            });

            return CreatedAtAction(nameof(GetById), new { id = createdEvent.Id }, createdEvent);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateEventDto dto)
        {
            var result = await _eventService.UpdateEventAsync(id, dto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, [FromQuery] Guid userId)
        {
            var result = await _eventService.DeleteEventAsync(id, userId);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPost("{id}/rsvp")]
        public async Task<IActionResult> RSVP(Guid id, [FromQuery] Guid userId, [FromBody] EventRSVPDto dto)
        {
            if (string.IsNullOrEmpty(dto.UserRSVPStatus))
                return BadRequest("UserRSVPStatus parametresi gerekli.");

            if (!Enum.TryParse<EventRSVP.EventStatus>(dto.UserRSVPStatus, true, out var statusEnum))
                return BadRequest($"Geçersiz katýlým durumu: '{dto.UserRSVPStatus}'. Geçerli deðerler: Attending, Interested, Declined");

            var result = await _eventService.AddRSVPAsync(id, userId, statusEnum);
            if (!result)
                return BadRequest("Katýlým iþlemi baþarýsýz.");
            return Ok();
        }
    }
}