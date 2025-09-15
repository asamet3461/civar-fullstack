using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class PostRepository : GenericRepository<Post>, IPostRepository
    {
        public PostRepository(DatabaseContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Post>> GetPostsByNeighborhoodAsync(Guid neighborhoodId)
        {
            return await _context.Posts
                .Where(p => p.NeighborhoodId == neighborhoodId)
                .Where(p => p.IsActive) 
                .Include(p => p.User)
                .Include(p => p.Neighborhood)
                .Include(p => p.Comments)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetPostsByUserIdAsync(Guid userId)
        {
            return await _context.Posts
                .Where(p => p.UserId == userId)
                .Where(p => p.IsActive) 
                .Include(p => p.User)
                .Include(p => p.Neighborhood)
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetPostsByTypeAsync(Post.PostType type)
        {
            return await _context.Posts
                .Where(p => p.Type == type)
                .Where(p => p.IsActive) 
                .Include(p => p.User) 
                .Include(p => p.Neighborhood) 
                .ToListAsync();
        }

        public async Task<IEnumerable<Post>> GetRecentPostsAsync(int count)
        {
            return await _context.Posts
                .Where(p => p.IsActive) 
                .OrderByDescending(p => p.CreatedAt)
                .Take(count)
                .Include(p => p.User)
                .Include(p => p.Neighborhood) 
                .Include(p => p.Comments)
                .ToListAsync();
        }

        public override IQueryable<Post> GetAll()
        {
            return _context.Posts
                .Include(p => p.User)
                .Include(p => p.Neighborhood);
        }

        public override async Task<Post?> GetByIdAsync(Guid id)
        {
            return await _context.Posts
                .Include(p => p.Comments)
                    .ThenInclude(c => c.User) 
                .Include(p => p.User)
                .Include(p => p.Neighborhood)
                .FirstOrDefaultAsync(p => p.Id == id);
        }
    }
}
