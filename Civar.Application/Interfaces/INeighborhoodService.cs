using System.Collections.Generic;
using System.Threading.Tasks;
using Civar.Application.DTOs.Neighborhoods;
using System;

namespace Civar.Application.Interfaces
{
    public interface INeighborhoodService
    {
        Task<IEnumerable<NeighborhoodDto>> GetAllAsync();
        Task<NeighborhoodDto?> GetByIdAsync(Guid id);
        Task<NeighborhoodDto?> GetByDetailsAsync(string neighbourhood, string district, string city);
        Task<IEnumerable<NeighborhoodDto>> GetByCityAsync(string city);
        Task<NeighborhoodDto> CreateAsync(CreateNeighborhoodDto createDto);
        Task<bool> UpdateAsync(Guid id, UpdateNeighborhoodDto updateDto);
        Task<bool> DeleteAsync(Guid id);
    }
}