using Civar.Infrastructure;
using Civar.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class LocationController : ControllerBase
{
    private readonly DatabaseContext _context;

    public LocationController(DatabaseContext context)
    {
        _context = context;
    }


    [HttpGet("cities")]
    public async Task<IActionResult> GetCities()
    {
        var cities = await _context.Neighborhoods
            .Select(n => n.City)
            .Where(city => !string.IsNullOrEmpty(city))
            .Distinct()
            .ToListAsync();

        return Ok(cities);
    }


    [HttpGet("districts")]
    public async Task<IActionResult> GetDistricts([FromQuery] string city)
    {
        var districts = await _context.Neighborhoods
            .Where(n => n.City == city)
            .Select(n => n.District)
            .Where(district => !string.IsNullOrEmpty(district))
            .Distinct()
            .ToListAsync();

        return Ok(districts);
    }

    [HttpGet("neighborhoods")]
    public async Task<IActionResult> GetNeighborhoods([FromQuery] string city, [FromQuery] string district)
    {
        var neighborhoods = await _context.Neighborhoods
            .Where(n => n.City == city && n.District == district)
            .Select(n => new { n.Id, n.Neighbourhood })
            .ToListAsync();

        return Ok(neighborhoods);
    }
}