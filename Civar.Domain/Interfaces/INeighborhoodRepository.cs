using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Civar.Domain.Entities;

namespace Civar.Domain.Interfaces
{
    public interface INeighborhoodRepository : IGenericRepository<Neighborhood>
    {
        Task<Neighborhood?> GetByDetailsAsync(string neighbourhood, string district, string city);
        Task<IEnumerable<Neighborhood>> GetNeighborhoodsByCityAsync(string city);
        Task<Neighborhood?> GetByIdWithUsersAsync(Guid id);
    }
    }

