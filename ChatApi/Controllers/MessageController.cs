using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using ChatApi.Models;
using System.Security.Claims;
using System.ComponentModel.DataAnnotations;

namespace ChatApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public MessageController(ChatDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        [HttpPost]
        public async Task<ActionResult<Message>> PostMessage([FromBody] MessageRequest request)
        {
            if (string.IsNullOrEmpty(request.Content) || string.IsNullOrEmpty(request.ReceiverId))
            {
                return BadRequest("Content and ReceiverId are required");
            }

            var senderId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId))
            {
                return Unauthorized();
            }

            var message = new Message
            {
                Content = request.Content,
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Timestamp = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // Load the sender details for the response
            await _context.Entry(message)
                .Reference(m => m.Sender)
                .LoadAsync();

            return CreatedAtAction(nameof(GetUserMessages), new { userId = message.SenderId }, message);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetRecentMessages([FromQuery] int limit = 50)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderByDescending(m => m.Timestamp)
                .Take(limit)
                .ToListAsync();
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetUserMessages(string userId, [FromQuery] int limit = 50)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(currentUserId))
            {
                return Unauthorized();
            }

            return await _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => (m.SenderId == currentUserId && m.ReceiverId == userId) ||
                           (m.SenderId == userId && m.ReceiverId == currentUserId))
                .OrderByDescending(m => m.Timestamp)
                .Take(limit)
                .ToListAsync();
        }

        [HttpGet("between")]
        public async Task<ActionResult<IEnumerable<Message>>> GetMessagesBetweenUsers(
            [FromQuery] string user1Id,
            [FromQuery] string user2Id,
            [FromQuery] int limit = 50)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Where(m => (m.SenderId == user1Id && m.SenderId == user2Id) ||
                           (m.SenderId == user2Id && m.SenderId == user1Id))
                .OrderByDescending(m => m.Timestamp)
                .Take(limit)
                .ToListAsync();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMessage(string id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();

            // Only allow deletion if the user is the sender
            if (message.SenderId != userId)
                return Forbid();

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }

    public class MessageRequest
    {
        [Required]
        public string Content { get; set; } = string.Empty;

        [Required]
        public string ReceiverId { get; set; } = string.Empty;
    }
}