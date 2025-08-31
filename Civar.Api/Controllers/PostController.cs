using Civar.Application.DTOs.Posts;
using Civar.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Civar.Infrastructure.RabbitMQ;

namespace Civar.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PostController : ControllerBase
    {
        private readonly IPostService _postService;
        private readonly PostPublisher _postPublisher;

        public PostController(IPostService postService, PostPublisher postPublisher)
        {
            _postService = postService;
            _postPublisher = postPublisher;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] Guid? userId, [FromQuery] Guid? neighborhoodId)
        {
            if (neighborhoodId.HasValue)
            {
                var posts = await _postService.GetPostsByNeighborhoodAsync(neighborhoodId.Value);
                return Ok(posts);
            }
            else if (userId.HasValue)
            {
                var posts = await _postService.GetAllPostsForUserAsync(userId.Value);
                return Ok(posts);
            }
            else
            {
                var posts = await _postService.GetAllPostsAsync();
                return Ok(posts);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var post = await _postService.GetPostByIdAsync(id);
            if (post == null)
                return NotFound();
            return Ok(post);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePostDto dto, [FromQuery] Guid userId)
        {
            var createdPost = await _postService.CreatePostAsync(dto, userId);

            _postPublisher.PublishPost(new Civar.Application.Events.PostMessage
            {
                PostId = createdPost.Id.ToString(),
                NeighborhoodId = createdPost.NeighborhoodId.ToString(),
                UserId = createdPost.UserId.ToString(),
                Title = createdPost.Title,
                Content = createdPost.Content,
                CreatedAt = createdPost.CreatedAt
            });

            return CreatedAtAction(nameof(GetById), new { id = createdPost.Id }, createdPost);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromQuery] Guid userId, [FromBody] UpdatePostDto dto)
        {
            var result = await _postService.UpdatePostAsync(id, userId, dto);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id, [FromQuery] Guid userId)
        {
            var result = await _postService.DeletePostAsync(id, userId);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [HttpPost("{postId}/comments")]
        public async Task<IActionResult> AddComment(Guid postId, [FromQuery] Guid userId, [FromBody] string content)
        {
            var commentDto = await _postService.AddCommentAsync(postId, userId, content);
            return Ok(commentDto);
        }

        [HttpGet("{postId}/comments")]
        public async Task<IActionResult> GetComments(Guid postId)
        {
            var comments = await _postService.GetCommentsByPostIdAsync(postId);
            return Ok(comments);
        }

        [HttpDelete("comments/{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid commentId, [FromQuery] Guid userId)
        {
            var result = await _postService.DeleteCommentAsync(commentId, userId);
            if (!result)
                return Forbid();
            return NoContent();
        }
    }
}