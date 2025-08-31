using Civar.Domain.Entities;
using Civar.Domain.Interfaces;

namespace Civar.Infrastructure.Persistence.Repositories
{
    public class AuditLogRepository : GenericRepository<AuditLog>, IAuditLogRepository
    {
        public AuditLogRepository(DatabaseContext context) : base(context)
        {
        }
    }
}