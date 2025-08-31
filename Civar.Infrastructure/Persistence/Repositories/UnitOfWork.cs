using Civar.Domain.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;

namespace Civar.Infrastructure.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly DatabaseContext _context;

        public UnitOfWork(DatabaseContext context)
        {
            _context = context;
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            return await _context.SaveChangesAsync(cancellationToken);
        }

        public async Task<ITransaction> BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            var transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
            return new DbContextTransactionWrapper(transaction);
        }

        public void Dispose()
        {
            _context?.Dispose();
        }
    }

    public class DbContextTransactionWrapper : ITransaction
    {
        private readonly IDbContextTransaction _dbContextTransaction;
        private bool _completed = false;

        public DbContextTransactionWrapper(IDbContextTransaction dbContextTransaction)
        {
            _dbContextTransaction = dbContextTransaction;
        }

        public async Task CommitAsync(CancellationToken cancellationToken = default)
        {
            if (_completed) return;
            await _dbContextTransaction.CommitAsync(cancellationToken);
            _completed = true;
        }

        public async Task RollbackAsync(CancellationToken cancellationToken = default)
        {
            if (_completed) return;
            await _dbContextTransaction.RollbackAsync(cancellationToken);
            _completed = true;
        }

        public void Dispose()
        {
            _dbContextTransaction.Dispose();
        }
    }
}