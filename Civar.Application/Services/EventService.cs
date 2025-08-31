using AutoMapper;
using Civar.Application.DTOs.Events;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;


namespace Civar.Application.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<EventService> _logger;
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly INeighborhoodRepository _neighborhoodRepository;
        private readonly IEmailNotificationService _emailNotificationService;
        private readonly IUserRepository _userRepository;

        public EventService(
            IEventRepository eventRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<EventService> logger,
            IAuditLogRepository auditLogRepository,
            INeighborhoodRepository neighborhoodRepository,
            IEmailNotificationService emailNotificationService,
            IUserRepository userRepository)
        {
            _eventRepository = eventRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _auditLogRepository = auditLogRepository;
            _neighborhoodRepository = neighborhoodRepository;
            _emailNotificationService = emailNotificationService;
            _userRepository = userRepository;
        }

        public async Task<EventDto> CreateEventAsync(CreateEventDto dto, Guid userId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = new Event(
                    dto.NeighborhoodId,
                    userId,
                    dto.Title,
                    dto.Description,
                    DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc),
                    DateTime.SpecifyKind(dto.EndTime, DateTimeKind.Utc),
                    dto.Location ?? string.Empty
                );

                var neighborhood = await _neighborhoodRepository.GetByIdWithUsersAsync(dto.NeighborhoodId);
                if (neighborhood != null && neighborhood.Users != null)
                {
                    var userIds = neighborhood.Users
                        .Select(u => u.Id)
                        .Distinct()
                        .Where(id => id != userId)
                        .ToList();

                    foreach (var otherUserId in userIds)
                    {
                        entity.Notifications.Add(new Notification(
                            userId: otherUserId,
                            type: Notification.NotificationType.NewEvent,
                            text: $"Mahallende yeni bir etkinlik oluşturuldu: {dto.Title}",
                            neighborhoodId: dto.NeighborhoodId,
                            eventId: entity.Id
                        ));

                        var user = await _userRepository.GetByIdAsync(otherUserId);
                        if (user != null && !string.IsNullOrEmpty(user.Email))
                        {
                            _emailNotificationService.SendNotification(
                                user.Email,
                                "Mahallende Yeni Etkinlik",
                                $"Mahallende yeni bir etkinlik oluşturuldu: {dto.Title}"
                            );
                        }
                    }
                }

                await _eventRepository.AddAsync(entity);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "CreateEvent",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Etkinlik oluşturuldu: {dto.Title} (MahalleId: {dto.NeighborhoodId})"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Etkinlik başarıyla oluşturuldu: {Title}", dto.Title);
                return _mapper.Map<EventDto>(entity);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Etkinlik oluşturulurken hata: {Title}", dto.Title);
                throw;
            }
        }

        public async Task<bool> AddRSVPAsync(Guid eventId, Guid userId, EventRSVP.EventStatus status)
        {
            Console.WriteLine($"[AddRSVPAsync] eventId: {eventId}, userId: {userId}, status: {status}");
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var eventEntity = await _eventRepository.GetByIdWithRSVPsAsync(eventId);
                if (eventEntity == null)
                {
                    Console.WriteLine("[AddRSVPAsync] eventEntity NULL! eventId: " + eventId);
                    return false;
                }

                Console.WriteLine("[AddRSVPAsync] RSVP count: " + (eventEntity.RSVPs?.Count ?? 0));
                if (eventEntity.RSVPs != null)
                {
                    foreach (var r in eventEntity.RSVPs)
                        Console.WriteLine($"RSVP: UserId={r.UserId}, EventId={r.EventId}, Status={r.Status}");
                }

                var existingRSVP = eventEntity.RSVPs.FirstOrDefault(r => r.UserId == userId);

                if (existingRSVP != null)
                {
                    Console.WriteLine("[AddRSVPAsync] RSVP already exists, updating status.");
                    existingRSVP.UpdateStatus(status);
                }
                else
                {
                    Console.WriteLine("[AddRSVPAsync] RSVP not found, creating new.");
                    var rsvp = new EventRSVP(userId, eventId, status);
                    eventEntity.RSVPs.Add(rsvp);
                }

                var existingNotif = eventEntity.Notifications
                    .FirstOrDefault(n => n.UserId == userId && n.EventId == eventEntity.Id && n.Type == Notification.NotificationType.NewRSVP);

                if (existingNotif != null)
                {
                    existingNotif.UpdateTextAndStatus($"Bir kullanıcı etkinliğine '{status}' olarak yanıt verdi.", false);
                }
                else
                {
                    eventEntity.Notifications.Add(new Notification(
                        userId: userId, 
                        type: Notification.NotificationType.NewRSVP,
                        text: $"Bir kullanıcı etkinliğine '{status}' olarak yanıt verdi.",
                        neighborhoodId: eventEntity.NeighborhoodId,
                        eventId: eventEntity.Id
                    ));
                }
             

                _eventRepository.Update(eventEntity);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "AddEventRSVP",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Etkinliğe katılım: EventId={eventId}, UserId={userId}, Status={status}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Etkinliğe katılım eklendi/güncellendi. EventId: {EventId}, UserId: {UserId}", eventId, userId);
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[AddRSVPAsync] Exception: {ex}");
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Etkinliğe katılım eklenirken hata oluştu. EventId: {EventId}", eventId);
                return false;
            }
        }
        public async Task<bool> UpdateEventAsync(Guid eventId, UpdateEventDto dto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = await _eventRepository.GetByIdAsync(eventId);
                if (entity == null) return false;

                entity.UpdateEvent(
                    dto.Title,
                    dto.Description,
                    DateTime.SpecifyKind(dto.StartTime, DateTimeKind.Utc),
                    DateTime.SpecifyKind(dto.EndTime, DateTimeKind.Utc),
                    dto.Location
                );
                _eventRepository.Update(entity);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = entity.UserId.ToString(),
                    Action = "UpdateEvent",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Etkinlik güncellendi: {dto.Title} (EventId: {eventId})"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Etkinlik güncellendi: {EventId}", eventId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Etkinlik güncellenirken hata: {EventId}", eventId);
                return false;
            }
        }

        public async Task<bool> DeleteEventAsync(Guid eventId, Guid userId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var entity = await _eventRepository.GetByIdAsync(eventId);
                if (entity == null)
                    return false;

       
                if (entity.UserId != userId)
                    return false;

                _eventRepository.Remove(entity);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = entity.UserId.ToString(),
                    Action = "DeleteEvent",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Etkinlik silindi: {entity.Title} (EventId: {eventId})"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Etkinlik silindi: {EventId}", eventId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Etkinlik silinirken hata: {EventId}", eventId);
                return false;
            }
        }

        public async Task<EventDto?> GetEventByIdAsync(Guid eventId)
        {

            var entity = await _eventRepository.GetByIdWithRSVPsAsync(eventId);
            if (entity == null) return null;

    
            if (!(entity is Event))
                throw new InvalidOperationException($"Mapping için beklenen tip: Event, gelen tip: {entity.GetType().Name}");

            var dto = _mapper.Map<EventDto>(entity);

            var neighborhood = await _neighborhoodRepository.GetByIdWithUsersAsync(entity.NeighborhoodId);

            if (neighborhood != null && neighborhood.Users != null)
            {
                dto.Participants = neighborhood.Users.Select(u => new EventParticipantStatusDto
                {
                    UserId = u.Id,
                    UserName = u.Name,
                    UserRSVPStatus = entity.RSVPs.FirstOrDefault(r => r.UserId == u.Id)?.Status.ToString()
                }).ToList();
            }
            else
            {
                dto.Participants = new List<EventParticipantStatusDto>();
            }

            return dto;
        }

        public async Task<List<EventDto>> GetEventsByNeighborhoodAsync(Guid neighborhoodId)
        {
            var events = await _eventRepository.GetEventsByNeighborhoodAsync(neighborhoodId);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetEventsByUserIdAsync(Guid userId)
        {
            var events = await _eventRepository.GetEventsByUserIdAsync(userId);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetUpcomingEventsAsync(int count)
        {
            var events = await _eventRepository.GetUpcomingEventsAsync(count);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetPastEventsAsync(int count)
        {
            var events = await _eventRepository.GetPastEventsAsync(count);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetEventsUserIsAttendingAsync(Guid userId)
        {
            var events = await _eventRepository.GetEventsUserIsAttendingAsync(userId);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetEventsInDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var events = await _eventRepository.GetEventsInDateRangeAsync(startDate, endDate);
            return _mapper.Map<List<EventDto>>(events);
        }

        public async Task<List<EventDto>> GetAllEventsAsync(Guid? neighborhoodId = null)
        {
            var query = _eventRepository.GetAllWithIncludes().AsQueryable();
            if (neighborhoodId.HasValue)
                query = query.Where(e => e.NeighborhoodId == neighborhoodId.Value);
            var events = await query.ToListAsync();
            return _mapper.Map<List<EventDto>>(events);
        }
    }
}