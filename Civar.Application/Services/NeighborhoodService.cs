using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Civar.Application.DTOs.Neighborhoods;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Civar.Application.Services
{
    public class NeighborhoodService : INeighborhoodService
    {
        private readonly INeighborhoodRepository _neighborhoodRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<NeighborhoodService> _logger;
        private readonly IAuditLogRepository _auditLogRepository;

        public NeighborhoodService(
            INeighborhoodRepository neighborhoodRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<NeighborhoodService> logger,
            IAuditLogRepository auditLogRepository)
      => (_neighborhoodRepository, _unitOfWork, _mapper, _logger, _auditLogRepository)
             = (neighborhoodRepository, unitOfWork, mapper, logger, auditLogRepository);
        
        public async Task<NeighborhoodDto> CreateAsync(CreateNeighborhoodDto createDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = _mapper.Map<Neighborhood>(createDto);

                await _neighborhoodRepository.AddAsync(entity);
                await _unitOfWork.SaveChangesAsync();

                entity.Notifications.Add(new Notification(
                    userId: Guid.Empty, 
                    type: Notification.NotificationType.NewNeighbor,
                    text: "Yeni bir komşu mahalleye katıldı.",
                    neighborhoodId: entity.Id
                ));

                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = Guid.Empty.ToString(), 
                    Action = "Neighborhood Created",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Neighborhood: {entity.Neighbourhood}, District: {entity.District}, City: {entity.City}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Neighborhood created: {Neighborhood}, {District}, {City}", entity.Neighbourhood, entity.District, entity.City);
                return _mapper.Map<NeighborhoodDto>(entity);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while creating neighborhood.");
                throw;
            }
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = await _neighborhoodRepository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Neighborhood not found for delete. Id: {Id}", id);
                    return false;
                }

                _neighborhoodRepository.Remove(entity);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = Guid.Empty.ToString(), 
                    Action = "Neighborhood Deleted",
                    Timestamp = DateTime.UtcNow,
                    Details = $"NeighborhoodId: {id}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Neighborhood deleted. Id: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while deleting neighborhood. Id: {Id}", id);
                return false;
            }
        }

        public async Task<IEnumerable<NeighborhoodDto>> GetAllAsync()
        {
            var entities = await _neighborhoodRepository.GetAll().AsNoTracking()
                .Select(n => new NeighborhoodDto
                {
                    Id = n.Id,
                    Neighbourhood = n.Neighbourhood,
                    District = n.District,
                    City = n.City
                }).ToListAsync();
            return entities;
        }

        public async Task<IEnumerable<NeighborhoodDto>> GetByCityAsync(string city)
        {
            var entities = await _neighborhoodRepository.GetNeighborhoodsByCityAsync(city);
            return _mapper.Map<IEnumerable<NeighborhoodDto>>(entities);
        }

        public async Task<NeighborhoodDto?> GetByDetailsAsync(string neighbourhood, string district, string city)
        {
            var entity = await _neighborhoodRepository.GetByDetailsAsync(neighbourhood, district, city);
            return entity == null ? null : _mapper.Map<NeighborhoodDto>(entity);
        }

        public async Task<NeighborhoodDto?> GetByIdAsync(Guid id)
        {
            var entity = await _neighborhoodRepository.GetByIdAsync(id);
            return entity == null ? null : _mapper.Map<NeighborhoodDto>(entity);
        }

        public async Task<bool> UpdateAsync(Guid id, UpdateNeighborhoodDto updateDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = await _neighborhoodRepository.GetByIdAsync(id);
                if (entity == null)
                {
                    _logger.LogWarning("Neighborhood not found for update. Id: {Id}", id);
                    return false;
                }

                _mapper.Map(updateDto, entity);
                _neighborhoodRepository.Update(entity);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = Guid.Empty.ToString(), 
                    Action = "Neighborhood Updated",
                    Timestamp = DateTime.UtcNow,
                    Details = $"NeighborhoodId: {id}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Neighborhood updated. Id: {Id}", id);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error occurred while updating neighborhood. Id: {Id}", id);
                return false;
            }
        }
    }
}