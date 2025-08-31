using Civar.Application.DTOs.Neighborhoods;
using Civar.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Civar.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NeighborhoodController : ControllerBase
    {
        private readonly INeighborhoodService _neighborhoodService;

        public NeighborhoodController(INeighborhoodService neighborhoodService)
        {
            _neighborhoodService = neighborhoodService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var neighborhoods = await _neighborhoodService.GetAllAsync();
            return Ok(neighborhoods);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var neighborhood = await _neighborhoodService.GetByIdAsync(id);
            if (neighborhood == null)
                return NotFound();
            return Ok(neighborhood);
        }

        [HttpGet("by-details")]
        public async Task<IActionResult> GetByDetails([FromQuery] string neighbourhood, [FromQuery] string district, [FromQuery] string city)
        {
            var neighborhood = await _neighborhoodService.GetByDetailsAsync(neighbourhood, district, city);
            if (neighborhood == null)
                return NotFound();
            return Ok(neighborhood);
        }

        [HttpGet("by-city/{city}")]
        public async Task<IActionResult> GetByCity(string city)
        {
            var neighborhoods = await _neighborhoodService.GetByCityAsync(city);
            return Ok(neighborhoods);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNeighborhoodDto dto)
        {
            var created = await _neighborhoodService.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UpdateNeighborhoodDto dto)
        {
            var result = await _neighborhoodService.UpdateAsync(id, dto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var result = await _neighborhoodService.DeleteAsync(id);
            if (!result)
                return NotFound();
            return NoContent();
        }
    }
}