using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Civar.Application.DTOs.Posts;
using Civar.Application.Interfaces;
using Civar.Domain.Entities;
using Civar.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace Civar.Application.Services
{
    public class PostService : IPostService
    {
        private readonly IPostRepository _postRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ILogger<PostService> _logger;
        private readonly IAuditLogRepository _auditLogRepository;
        private readonly IGenericRepository<Neighborhood> _neighborhoodRepository;
        private readonly IGenericRepository<User> _userRepository;
        private readonly IEmailNotificationService _emailNotificationService;

        public PostService(
            IPostRepository postRepository,
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ILogger<PostService> logger,
            IAuditLogRepository auditLogRepository,
            IGenericRepository<Neighborhood> neighborhoodRepository,
            IGenericRepository<User> userRepository,
            IEmailNotificationService emailNotificationService
        )
        {
            _postRepository = postRepository;
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _logger = logger;
            _auditLogRepository = auditLogRepository;
            _neighborhoodRepository = neighborhoodRepository;
            _userRepository = userRepository;
            _emailNotificationService = emailNotificationService;
        }

        // Yardımcı metot
        private async Task<Guid?> GetUserNeighborhoodIdAsync(Guid userId)
        {
            var user = await _userRepository.GetAll().FirstOrDefaultAsync(u => u.Id == userId);
            return user?.NeighborhoodId;
        }

        public async Task<PostDto> CreatePostAsync(CreatePostDto postDto, Guid userId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
         
                var userNeighborhoodId = await GetUserNeighborhoodIdAsync(userId);
                if (userNeighborhoodId == null || userNeighborhoodId != postDto.NeighborhoodId)
                    throw new Exception("Kullanıcı bu mahalleye kayıtlı değil.");

                var post = new Post(
                    neighborhoodId: postDto.NeighborhoodId,
                    userId: userId,
                    title: postDto.Title,
                    content: postDto.Content,
                    location: postDto.Location ?? string.Empty,
                    type: postDto.Type
                );

                await _postRepository.AddAsync(post);
                await _unitOfWork.SaveChangesAsync();

            
                var neighborhood = await _neighborhoodRepository.GetByIdAsync(post.NeighborhoodId);
                if (neighborhood != null)
                {
                    var userIds = await _userRepository.GetAll()
                        .Where(u => u.NeighborhoodId == post.NeighborhoodId && u.Id != userId)
                        .Select(u => u.Id)
                        .Distinct()
                        .ToListAsync();

                    foreach (var otherUserId in userIds)
                    {
                        post.Notifications.Add(new Notification(
                            userId: otherUserId,
                            type: Notification.NotificationType.NewPostInNeighborhood,
                            text: $"Mahallende yeni bir gönderi paylaşıldı: {post.Title}",
                            neighborhoodId: post.NeighborhoodId,
                            postId: post.Id
                        ));

                        var user = await _userRepository.GetByIdAsync(otherUserId);
                        if (user != null && !string.IsNullOrEmpty(user.Email))
                        {
                            _emailNotificationService.SendNotification(
                                user.Email,
                                "Mahallende Yeni Gönderi",
                                $"Mahallende yeni bir gönderi paylaşıldı: {post.Title}"
                            );
                        }
                    }
                }

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = post.UserId.ToString(),
                    Action = "CreatePost",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Post oluşturuldu: {post.Title}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Post başarıyla oluşturuldu: {Title}", post.Title);
                return _mapper.Map<PostDto>(post);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Post oluşturulurken hata: {Title}", postDto.Title);
                throw;
            }
        }

        public async Task<CommentDto> AddCommentAsync(Guid postId, Guid userId, string content)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var post = await _postRepository.GetByIdAsync(postId);
                if (post == null || !post.IsActive)
                    throw new Exception("Post bulunamadı.");

                var comment = new Comment(userId, postId, content);
                post.Comments.Add(comment);

                _postRepository.Update(post);
                await _unitOfWork.SaveChangesAsync();

                post.Notifications.Add(new Notification(
                    userId: post.UserId,
                    type: Notification.NotificationType.NewCommentOnYourPost,
                    text: "Gönderinize yeni bir yorum yapıldı.",
                    neighborhoodId: post.NeighborhoodId,
                    postId: post.Id,
                    commentId: comment.Id
                ));

                _postRepository.Update(post);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = userId.ToString(),
                    Action = "AddComment",
                    Timestamp = DateTime.UtcNow,
                    Details = $"PostId: {postId}, Yorum: {content}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Yorum eklendi. PostId: {PostId}, UserId: {UserId}", postId, userId);

                return _mapper.Map<CommentDto>(comment);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Yorum eklenirken hata oluştu. PostId: {PostId}", postId);
                throw;
            }
        }

        public async Task<bool> DeletePostAsync(Guid postId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var post = await _postRepository.GetByIdAsync(postId);
                if (post == null || !post.IsActive) return false;

                post.IsActive = false;
                _postRepository.Update(post);

                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = post.UserId.ToString(),
                    Action = "DeletePost",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Post silindi: {post.Title}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Post silindi: {Id}", postId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Post silinirken hata: {Id}", postId);
                return false;
            }
        }

        public async Task<bool> DeletePostAsync(Guid postId, Guid userId)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var post = await _postRepository.GetByIdAsync(postId);
                if (post == null || !post.IsActive || post.UserId != userId)
                    return false; 

                post.IsActive = false;
                _postRepository.Update(post);

                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = post.UserId.ToString(),
                    Action = "DeletePost",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Post silindi: {post.Title}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Post silindi: {Id}", postId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Post silinirken hata: {Id}", postId);
                return false;
            }
        }

        public async Task<List<PostDto>> GetAllPostsForUserAsync(Guid userId)
        {
            var neighborhoodId = await GetUserNeighborhoodIdAsync(userId);
            if (neighborhoodId == null)
                return new List<PostDto>();

            var posts = await _postRepository.GetAll()
                .Where(p => p.IsActive && p.NeighborhoodId == neighborhoodId)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<PostDto>>(posts);
        }

        public async Task<List<PostDto>> GetPostsByTypeForUserAsync(Guid userId, Post.PostType type)
        {
            var neighborhoodId = await GetUserNeighborhoodIdAsync(userId);
            if (neighborhoodId == null)
                return new List<PostDto>();

            var posts = await _postRepository.GetAll()
                .Where(p => p.IsActive && p.NeighborhoodId == neighborhoodId && p.Type == type)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return _mapper.Map<List<PostDto>>(posts);
        }

        public async Task<List<PostDto>> GetRecentPostsForUserAsync(Guid userId, int count)
        {
            var neighborhoodId = await GetUserNeighborhoodIdAsync(userId);
            if (neighborhoodId == null)
                return new List<PostDto>();

            var posts = await _postRepository.GetAll()
                .Where(p => p.IsActive && p.NeighborhoodId == neighborhoodId)
                .OrderByDescending(p => p.CreatedAt)
                .Take(count)
                .ToListAsync();

            return _mapper.Map<List<PostDto>>(posts);
        }

        public async Task<List<PostDto>> GetPostsByNeighborhoodForUserAsync(Guid userId, Guid neighborhoodId)
        {
            var userNeighborhoodId = await GetUserNeighborhoodIdAsync(userId);
            if (userNeighborhoodId == null || userNeighborhoodId != neighborhoodId)
                return new List<PostDto>();

            var posts = await _postRepository.GetPostsByNeighborhoodAsync(neighborhoodId);
            return _mapper.Map<List<PostDto>>(posts.Where(p => p.IsActive).ToList());
        }

        public async Task<List<PostDto>> GetPostsByUserIdForUserAsync(Guid currentUserId, Guid targetUserId)
        {
            var currentNeighborhoodId = await GetUserNeighborhoodIdAsync(currentUserId);
            var targetNeighborhoodId = await GetUserNeighborhoodIdAsync(targetUserId);

            if (currentNeighborhoodId == null || targetNeighborhoodId == null || currentNeighborhoodId != targetNeighborhoodId)
                return new List<PostDto>();

            var posts = await _postRepository.GetPostsByUserIdAsync(targetUserId);
            return _mapper.Map<List<PostDto>>(posts.Where(p => p.IsActive).ToList());
        }

        public async Task<bool> UpdatePostAsync(Guid postId, UpdatePostDto postDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var post = await _postRepository.GetByIdAsync(postId);
                if (post == null || !post.IsActive) return false;

                post.UpdatePost(postDto.Title, postDto.Content, postDto.Location);
                _postRepository.Update(post);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = post.UserId.ToString(),
                    Action = "UpdatePost",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Post güncellendi: {post.Title}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Post güncellendi: {Id}", postId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Post güncellenirken hata: {Id}", postId);
                return false;
            }
        }

        public async Task<bool> UpdatePostAsync(Guid postId, Guid userId, UpdatePostDto postDto)
        {
            using var transaction = await _unitOfWork.BeginTransactionAsync();
            try
            {
                var post = await _postRepository.GetByIdAsync(postId);
                if (post == null || !post.IsActive || post.UserId != userId)
                    return false; 

                post.UpdatePost(postDto.Title, postDto.Content, postDto.Location);
                _postRepository.Update(post);
                await _unitOfWork.SaveChangesAsync();

                await _auditLogRepository.AddAsync(new AuditLog
                {
                    UserId = post.UserId.ToString(),
                    Action = "UpdatePost",
                    Timestamp = DateTime.UtcNow,
                    Details = $"Post güncellendi: {post.Title}"
                });
                await _unitOfWork.SaveChangesAsync();

                await transaction.CommitAsync();
                _logger.LogInformation("Post güncellendi: {Id}", postId);
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Post güncellenirken hata: {Id}", postId);
                return false;
            }
        }

        public async Task<List<CommentDto>> GetCommentsByPostIdAsync(Guid postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null || post.Comments == null)
                return new List<CommentDto>();

            return _mapper.Map<List<CommentDto>>(post.Comments.ToList());
        }

        public async Task<bool> DeleteCommentAsync(Guid commentId, Guid userId)
        {
        
            var post = await _postRepository.GetAll()
                .Include(p => p.Comments)
                .FirstOrDefaultAsync(p => p.Comments.Any(c => c.Id == commentId));
            if (post == null) return false;

            var comment = post.Comments.FirstOrDefault(c => c.Id == commentId);
            if (comment == null || comment.UserId != userId)
                return false; 

            post.Comments.Remove(comment);
            _postRepository.Update(post);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<PostDto?> GetPostByIdAsync(Guid postId)
        {
            var post = await _postRepository.GetByIdAsync(postId);
            if (post == null || !post.IsActive) return null;
            return _mapper.Map<PostDto>(post);
        }

        public async Task<List<PostDto>> GetPostsByNeighborhoodAsync(Guid neighborhoodId)
        {
            var posts = await _postRepository.GetPostsByNeighborhoodAsync(neighborhoodId);
            return _mapper.Map<List<PostDto>>(posts.Where(p => p.IsActive).ToList());
        }

        public async Task<List<PostDto>> GetPostsByUserIdAsync(Guid userId)
        {
            var posts = await _postRepository.GetPostsByUserIdAsync(userId);
            return _mapper.Map<List<PostDto>>(posts.Where(p => p.IsActive).ToList());
        }

        public async Task<List<PostDto>> GetPostsByTypeAsync(Post.PostType type)
        {
            var posts = await _postRepository.GetPostsByTypeAsync(type);
            return _mapper.Map<List<PostDto>>(posts.Where(p => p.IsActive).ToList());
        }

        public async Task<List<PostDto>> GetRecentPostsAsync(int count)
        {
            var posts = await _postRepository.GetRecentPostsAsync(count);
            return _mapper.Map<List<PostDto>>(posts.Where(p => p.IsActive).ToList());
        }

        public async Task<List<PostDto>> GetAllPostsAsync(Guid? neighborhoodId = null)
        {
            var query = _postRepository.GetAll().Where(p => p.IsActive);
            if (neighborhoodId.HasValue)
                query = query.Where(p => p.NeighborhoodId == neighborhoodId.Value);
            query = query.OrderByDescending(p => p.CreatedAt);
            var posts = await query.ToListAsync();
            return _mapper.Map<List<PostDto>>(posts);
        }
    }
}