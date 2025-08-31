using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Civar.Application.DTOs.Posts;
using Civar.Application.DTOs.Users;
using Civar.Domain.Entities;

namespace Civar.Application.Interfaces
{
    public interface IPostService
    {
        Task<PostDto> CreatePostAsync(CreatePostDto postDto, Guid userId);
        Task<PostDto?> GetPostByIdAsync(Guid postId);
        Task<List<PostDto>> GetPostsByNeighborhoodAsync(Guid neighborhoodId);
        Task<List<PostDto>> GetPostsByUserIdAsync(Guid userId);
        Task<List<PostDto>> GetPostsByTypeAsync(Post.PostType type);
        Task<List<PostDto>> GetRecentPostsAsync(int count);
        Task<bool> UpdatePostAsync(Guid postId, UpdatePostDto postDto);
        Task<bool> DeletePostAsync(Guid postId);
        
        Task<List<PostDto>> GetAllPostsAsync(Guid? neighborhoodId = null);
        Task<List<PostDto>> GetAllPostsForUserAsync(Guid userId);

        Task<CommentDto> AddCommentAsync(Guid postId, Guid userId, string content);
        Task<List<CommentDto>> GetCommentsByPostIdAsync(Guid postId);
        Task<bool> DeleteCommentAsync(Guid commentId, Guid userId);

        Task<bool> DeletePostAsync(Guid postId, Guid userId);
        Task<bool> UpdatePostAsync(Guid postId, Guid userId, UpdatePostDto postDto);
    }
}