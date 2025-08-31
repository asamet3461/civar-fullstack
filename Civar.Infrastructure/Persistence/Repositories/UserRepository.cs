using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class UserRepository(DatabaseContext context) : GenericRepository<User>(context), IUserRepository
    {
        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.AppUsers.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdWithNeighborhoodAsync(Guid id)
        {
            return await _context.AppUsers
                .Include(u => u.Neighborhood)
                .FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task<bool> ExistsByEmailAsync(string email)
        {
            return await _context.AppUsers.AnyAsync(u => u.Email == email);
        }
        public async Task<List<User>> GetUsersByNeighborhoodIdAsync(Guid neighborhoodId)
        {
            return await _context.AppUsers
                .Where(u => u.NeighborhoodId == neighborhoodId)
                .ToListAsync();
        }
    }
}