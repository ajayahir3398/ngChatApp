using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using ChatApi.Models;
using System.Linq;

namespace ChatApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ChatController : ControllerBase
    {
        private static readonly List<Message> _messageHistory = new List<Message>();

        [HttpGet("history")]
        public ActionResult<IEnumerable<Message>> GetMessageHistory()
        {
            return Ok(_messageHistory.OrderByDescending(m => m.Timestamp).Take(50));
        }

        [HttpPost("message")]
        public ActionResult<Message> SaveMessage(Message message)
        {
            _messageHistory.Add(message);
            return Ok(message);
        }
    }
} 