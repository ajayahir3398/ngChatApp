using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using ChatApi.Models;

namespace ChatApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class MessageController : ControllerBase
    {
        private readonly ChatDbContext _context;

        public MessageController(ChatDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Message>>> GetRecentMessages([FromQuery] int limit = 50)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .OrderByDescending(m => m.Timestamp)
                .Take(limit)
                .ToListAsync();
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<Message>>> GetUserMessages(string userId, [FromQuery] int limit = 50)
        {
            return await _context.Messages
                .Include(m => m.Sender)
                .Where(m => m.SenderId == userId)
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
            var message = await _context.Messages.FindAsync(id);
            if (message == null)
                return NotFound();

            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}