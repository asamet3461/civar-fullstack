using System.Linq.Expressions;
using Civar.Domain.Entities;
namespace Civar.Domain.Interfaces
{

    public interface IGenericRepository<T> where T : BaseEntity
    {
        IQueryable<T> GetAll();
        Task<T?> GetByIdAsync(Guid id);
        Task AddAsync(T entity);
        void Update(T entity);
        void Remove(T entity);
        Task<int> SaveChangesAsync();
    }
}