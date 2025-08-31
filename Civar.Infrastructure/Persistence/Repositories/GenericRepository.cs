using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Civar.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        protected readonly DatabaseContext _context;

        public GenericRepository(DatabaseContext context)
        {
            _context = context;
        }

        public virtual IQueryable<T> GetAll()
        {
            return _context.Set<T>().AsQueryable();
        }

        public virtual async Task<T?> GetByIdAsync(Guid id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task AddAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
        }

        public void Update(T entity)
        {
            _context.Entry(entity).State = EntityState.Modified;
        }

        public void Remove(T entity)
        {
            _context.Set<T>().Remove(entity);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }
    }
}
