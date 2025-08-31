using Civar.Domain.Entities;
using System.Threading.Tasks;

namespace Civar.Domain.Interfaces
{
    public interface IUserRepository : IGenericRepository<User>
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdWithNeighborhoodAsync(Guid id);
        Task<List<User>> GetUsersByNeighborhoodIdAsync(Guid neighborhoodId);
        Task<bool> ExistsByEmailAsync(string email);
    }
}