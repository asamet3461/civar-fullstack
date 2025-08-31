using AutoMapper;
using Civar.Application.DTOs.Users;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Civar.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPasswordHasher<ApplicationUser> _passwordHasher;
        private readonly ILogger<UserService> _logger;
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailNotificationService _emailNotificationService;

        public UserService(
            IUserRepository userRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IPasswordHasher<ApplicationUser> passwordHasher,
            ILogger<UserService> logger,
            IAuditLogRepository auditLogRepository,
            UserManager<ApplicationUser> userManager,
            IEmailNotificationService emailNotificationService)
        {
            _userRepository = userRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _passwordHasher = passwordHasher;
            _logger = logger;
            _auditLogRepository = auditLogRepository;
            _userManager = userManager;
            _emailNotificationService = emailNotificationService;
        }
        public async Task<UserDto?> GetByIdAsync(Guid userId)
        {
            return await GetUserByIdAsync(userId);
        }
        public async Task<UserDto> CreateUserAsync(CreateUserDto userDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = _mapper.Map<User>(userDto);
                var applicationUser = new ApplicationUser();
                user.PasswordHash = _passwordHasher.HashPassword(applicationUser, userDto.Password);

                await _userRepository.AddAsync(user);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = user.Id.ToString(),
                    Action = "CreateUser",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Kullanıcı oluşturuldu: {user.Email}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Kullanıcı başarıyla oluşturuldu: {Email}", userDto.Email);

                // Kullanıcıya hoş geldin maili gönder
                if (!string.IsNullOrEmpty(user.Email))
                {
                    _emailNotificationService.SendNotification(
                        user.Email,
                        "Hoş Geldiniz!",
                        "Sisteme başarıyla kaydoldunuz. Mahallenize hoş geldiniz!"
                    );
                }

                return _mapper.Map<UserDto>(user);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Kullanıcı oluşturulurken hata: {Email}", userDto.Email);
                throw;
            }
        }

        public async Task<UserDto?> GetUserByIdAsync(Guid userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;
            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto?> GetUserByEmailAsync(string email)
        {
            var user = await _userRepository.GetByEmailAsync(email);
            if (user == null) return null;
            return _mapper.Map<UserDto>(user);
        }

        public async Task<List<UserDto>> GetAllUsersAsync(Guid? neighborhoodId = null)
        {
            var query = _userRepository.GetAll().AsQueryable();
            if (neighborhoodId.HasValue)
                query = query.Where(u => u.NeighborhoodId == neighborhoodId.Value);
            var users = await query.ToListAsync();
            return _mapper.Map<List<UserDto>>(users);
        }

        public async Task<bool> UpdateUserProfileAsync(Guid userId, UpdateUserProfileDto profileDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return false;

                _mapper.Map(profileDto, user);
                _userRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "UpdateProfile",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Profil güncellendi: {userId}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Profil güncellenirken hata: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UpdatePasswordAsync(Guid userId, UpdatePasswordDto passwordDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return false;

         
                var applicationUser = await _userManager.FindByIdAsync(user.ApplicationUserId);
                if (applicationUser == null) return false;

                var isValid = !string.IsNullOrEmpty(applicationUser.PasswordHash) &&
                              _userManager.PasswordHasher.VerifyHashedPassword(applicationUser, applicationUser.PasswordHash, passwordDto.CurrentPassword)
                              == PasswordVerificationResult.Success;
                if (!isValid) return false;

               
                var newHash = _userManager.PasswordHasher.HashPassword(applicationUser, passwordDto.NewPassword);
                applicationUser.PasswordHash = newHash;
                user.PasswordHash = newHash;

                await _userManager.UpdateAsync(applicationUser);
                _userRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "UpdatePassword",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Şifre Güncellendi: {userId}"
                });

                await transaction.CommitAsync();
                _logger.LogInformation("Kullanıcı şifresi güncellendi: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Şifre güncellenirken hata: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> AdminUpdateUserStatusAsync(Guid userId, AdminUpdateUserStatusDto statusDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return false;

                _mapper.Map(statusDto, user);
                _userRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();
                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "AdminUpdateUsersStatus",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Kullanıcı Durumu Güncellendi: {userId}"
                });

                await transaction.CommitAsync();
                _logger.LogInformation("Kullanıcı durumu güncellendi: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Kullanıcı durumu güncellenirken hata: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UpdateProfilePictureAsync(Guid userId, UpdateProfilePictureDto pictureDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return false;

                if (pictureDto.ProfilePictureFile != null && pictureDto.ProfilePictureFile.Length > 0)
                {
                    var uploadsFolder = Path.Combine("wwwroot", "uploads", "profile-pictures");
                    Directory.CreateDirectory(uploadsFolder);
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(pictureDto.ProfilePictureFile.FileName)}";
                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await pictureDto.ProfilePictureFile.CopyToAsync(stream);
                    }

                    user.ProfilePicture = $"/uploads/profile-pictures/{fileName}";
                }

                _userRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "UpdateProfilePicture",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Kullanıcı Profil Resmi Güncellendi: {userId}"
                });

                await transaction.CommitAsync();
                _logger.LogInformation("Kullanıcı profil resmi güncellendi: {UserId}", userId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Kullanıcı güncellenirken hata oluştu: {UserId}", userId);
                return false;
            }
        }

        public async Task<bool> UpdateUserNeighborhoodAsync(Guid userId, Guid neighborhoodId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var user = await _userRepository.GetByIdAsync(userId);
                if (user == null) return false;

                user.UpdateNeighborhood(neighborhoodId); 
                _userRepository.Update(user);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "UpdateUserNeighborhood",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Kullanıcı mahallesi güncellendi: {userId} -> {neighborhoodId}"
                });

           
                if (user != null && !string.IsNullOrEmpty(user.Email))
                {
                    _logger.LogInformation("Kullanıcı mahalleye katıldı, bildirim ve e-posta gönderilecek: {Email}", user.Email);
                    _emailNotificationService.SendNotification(
                        user.Email,
                        "Mahalleye Katıldınız",
                        "Mahallenize başarıyla katıldınız. Hoş geldiniz!"
                    );
                }

                var otherUsers = await _userRepository.GetAll()
                    .Where(u => u.NeighborhoodId == neighborhoodId && u.Id != userId)
                    .ToListAsync();

                foreach (var otherUser in otherUsers)
                {
                    if (!string.IsNullOrEmpty(otherUser.Email))
                    {
                        var userName = user?.Name ?? "Unknown";
                        var userSurname = user?.Surname ?? "User";
                        _emailNotificationService.SendNotification(
                            otherUser.Email,
                            "Mahallene Yeni Kullanıcı Katıldı",
                            $"Mahallene yeni bir kullanıcı katıldı: {userName} {userSurname}"
                        );
                    }
                }

                await transaction.CommitAsync();
                _logger.LogInformation("Kullanıcı mahallesi güncellendi: {UserId} -> {NeighborhoodId}", userId, neighborhoodId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Kullanıcı mahallesi güncellenirken hata: {UserId}", userId);
                return false;
            }
        }
    }
}