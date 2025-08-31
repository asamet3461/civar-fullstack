using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Civar.Application.DTOs.Messages;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using FluentValidation;
using System.Text.Json;

namespace Civar.Application.Services
{
    public class MessageService : IMessageService
    {
        private readonly IMessageRepository _messageRepository;
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<MessageService> _logger;
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IValidator<SendPrivateMessageDto> _privateMessageValidator;
        private readonly IValidator<SendNeighborhoodMessageDto> _neighborhoodMessageValidator;
        private readonly IMessagePublisher _messagePublisher;

        public MessageService(
       IMessageRepository messageRepository,
       IUserRepository userRepository,
       IUnitOfWork unitOfWork,
       IMapper mapper,
       ILogger<MessageService> logger,
       IAuditLogRepository auditLogRepository,
       IValidator<SendPrivateMessageDto> privateMessageValidator,
       IValidator<SendNeighborhoodMessageDto> neighborhoodMessageValidator,
       IMessagePublisher messagePublisher)
        {
            _messageRepository = messageRepository;
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _auditLogRepository = auditLogRepository;
            _privateMessageValidator = privateMessageValidator;
            _neighborhoodMessageValidator = neighborhoodMessageValidator;
            _messagePublisher = messagePublisher;
        }

        public async Task<MessageDto> SendPrivateMessageAsync(Guid senderId, SendPrivateMessageDto dto)
        {
            var validationResult = await _privateMessageValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException($"Validation failed: {errors}");
            }

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var sender = await _userRepository.GetByIdAsync(senderId);
                var receiver = await _userRepository.GetByIdAsync(dto.ReceiverId);

                if (sender == null) throw new ArgumentException("Gönderen kullanıcı bulunamadı");
                if (receiver == null) throw new ArgumentException("Alıcı kullanıcı bulunamadı");
                if (senderId == dto.ReceiverId) throw new ArgumentException("Kendinize mesaj gönderemezsiniz");

                var message = Message.CreatePrivateMessage(senderId, dto.ReceiverId, dto.Content);

                await _messageRepository.AddAsync(message);
                await _unitOfWork.SaveChangesAsync();

                var notification = new Notification(
                    userId: dto.ReceiverId,
                    type: Notification.NotificationType.NewMessage,
                    text: $"{sender.FirstName} {sender.LastName} size bir mesaj gönderdi",
                    neighborhoodId: receiver.NeighborhoodId ?? new Guid(),
                    messageId: message.Id,
                    senderId: senderId
                );
                message.Notifications.Add(notification);

                await _unitOfWork.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Kişisel mesaj gönderildi. SenderId: {SenderId}, ReceiverId: {ReceiverId}",
                    senderId, dto.ReceiverId);

                var result = _mapper.Map<MessageDto>(message);
                result.SenderName = $"{sender.FirstName} {sender.LastName}";
                result.ReceiverName = $"{receiver.FirstName} {receiver.LastName}";
                var serialized = JsonSerializer.Serialize(result);
                await _messagePublisher.PublishAsync($"private-messages:{dto.ReceiverId}", serialized);


                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Kişisel mesaj gönderilirken hata oluştu");
                throw;
            }
        }

        public async Task<MessageDto> SendNeighborhoodMessageAsync(Guid senderId, SendNeighborhoodMessageDto dto)
        {
            var validationResult = await _neighborhoodMessageValidator.ValidateAsync(dto);
            if (!validationResult.IsValid)
            {
                var errors = string.Join(", ", validationResult.Errors.Select(e => e.ErrorMessage));
                throw new ValidationException($"Validation failed: {errors}");
            }

            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var sender = await _userRepository.GetByIdWithNeighborhoodAsync(senderId);
                if (sender == null) throw new ArgumentException("Gönderen kullanıcı bulunamadı");
                if (sender.NeighborhoodId != dto.NeighborhoodId)
                    throw new UnauthorizedAccessException("Bu mahalleye mesaj gönderme yetkiniz yok");

                var message = Message.CreateNeighborhoodMessage(senderId, dto.NeighborhoodId, dto.Content);

                await _messageRepository.AddAsync(message);
                await _unitOfWork.SaveChangesAsync();

      
                var mahalleKullanicilari = await _userRepository.GetUsersByNeighborhoodIdAsync(dto.NeighborhoodId);
                foreach (var user in mahalleKullanicilari)
                {
                    if (user.Id == senderId) continue;
                    var notification = new Notification(
                        userId: user.Id,
                        type: Notification.NotificationType.NewNeighborhoodMessage,
                        text: $"{sender.FirstName} {sender.LastName} mahalleye mesaj gönderdi",
                        neighborhoodId: dto.NeighborhoodId,
                        messageId: message.Id
                    );
                    message.Notifications.Add(notification);
                }

                await _unitOfWork.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation("Mahalle mesajı gönderildi. SenderId: {SenderId}, NeighborhoodId: {NeighborhoodId}",
                    senderId, dto.NeighborhoodId);

                var result = _mapper.Map<MessageDto>(message);
                result.SenderName = $"{sender.FirstName} {sender.LastName}";
                result.NeighborhoodName = sender.Neighborhood?.Name;
                var serialized = JsonSerializer.Serialize(result);
                await _messagePublisher.PublishAsync($"neighborhood-messages:{dto.NeighborhoodId}", serialized);

                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Mahalle mesajı gönderilirken hata oluştu");
                throw;
            }
        }

        public async Task<IEnumerable<MessageDto>> GetPrivateMessagesAsync(Guid userId, Guid otherUserId, int page = 1, int pageSize = 50)
        {
            var messages = await _messageRepository.GetPrivateMessagesBetweenUsersAsync(userId, otherUserId, page, pageSize);
            var result = _mapper.Map<IEnumerable<MessageDto>>(messages);

            foreach (var msg in result)
            {
                msg.IsMine = msg.SenderId == userId;
            }

            return result.OrderBy(m => m.CreatedAt);
        }

        public async Task<IEnumerable<MessageDto>> GetNeighborhoodMessagesAsync(Guid neighborhoodId, Guid userId, int page = 1, int pageSize = 50)
        {
            var messages = await _messageRepository.GetNeighborhoodMessagesAsync(neighborhoodId, page, pageSize);
            var result = _mapper.Map<IEnumerable<MessageDto>>(messages);

            foreach (var msg in result)
            {
                msg.IsMine = msg.SenderId == userId;
            }

            return result.OrderBy(m => m.CreatedAt);
        }

        public async Task MarkAsReadAsync(Guid userId, Guid messageId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null) return;

            if (message.Type == MessageType.Private && message.ReceiverId != userId) return;

            message.MarkAsRead(userId);
            _messageRepository.Update(message);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task DeleteMessageAsync(Guid userId, Guid messageId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null) return;

        
            if (message.SenderId != userId) throw new UnauthorizedAccessException("Bu mesajı silme yetkiniz yok");

            message.SoftDelete(userId);
            _messageRepository.Update(message);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<MessageDto> SendMessageAsync(SendMessageDto dto)
        {
            var privateDto = new SendPrivateMessageDto
            {
                ReceiverId = dto.ReceiverId,
                Content = dto.Content
            };

            return await SendPrivateMessageAsync(dto.SenderId, privateDto);
        }

        public async Task<IEnumerable<MessageDto>> GetMessagesForUserAsync(Guid userId)
        {
            var messages = await _messageRepository.GetMessagesByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<MessageDto>>(messages);
        }

        public async Task<MessageDto?> GetMessageByIdAsync(Guid messageId)
        {
            var message = await _messageRepository.GetByIdAsync(messageId);
            return message == null ? null : _mapper.Map<MessageDto>(message);
        }

        public async Task MarkAsReadAsync(MarkMessageAsReadDto dto)
        {
            var message = await _messageRepository.GetByIdAsync(dto.MessageId);
            if (message?.ReceiverId.HasValue == true)
            {
                await MarkAsReadAsync(message.ReceiverId.Value, dto.MessageId);
            }
        }
    }
}