using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class NeighborhoodRepository : GenericRepository<Neighborhood>, INeighborhoodRepository
    {
        public NeighborhoodRepository(DatabaseContext context) : base(context)
        {
        }
        public IQueryable<Neighborhood> GetAll()
        {
            return _context.Neighborhoods.AsNoTracking();
        }
        public async Task<Neighborhood?> GetByDetailsAsync(string neighbourhood, string district, string city)
        {
            return await _context.Neighborhoods
                .FirstOrDefaultAsync(n => n.Neighbourhood == neighbourhood &&
                                          n.District == district &&
                                          n.City == city);
        }

        public async Task<IEnumerable<Neighborhood>> GetNeighborhoodsByCityAsync(string city)
        {
            return await _context.Neighborhoods
                .Where(n => n.City == city)
                .ToListAsync();
        }
        public async Task<Neighborhood?> GetByIdWithUsersAsync(Guid id)
        {
            return await _context.Neighborhoods
                .Include(n => n.Users)
                .FirstOrDefaultAsync(n => n.Id == id);
        }
    }

}
