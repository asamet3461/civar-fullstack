using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Civar.Domain.Entities;

namespace Civar.Domain.Interfaces
{
    public interface IPostRepository : IGenericRepository<Post>
    {
        Task<IEnumerable<Post>> GetPostsByNeighborhoodAsync(Guid neighborhoodId);
        Task<IEnumerable<Post>> GetPostsByUserIdAsync(Guid userId);
        Task<IEnumerable<Post>> GetPostsByTypeAsync(Post.PostType type);
        Task<IEnumerable<Post>> GetRecentPostsAsync(int count);
    }
}
