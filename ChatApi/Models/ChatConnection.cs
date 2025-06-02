using System;

namespace ChatApi.Models
{
    public class ChatConnection
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string UserId { get; set; }  
        public required string ConnectionId { get; set; }
        public required ApplicationUser User { get; set; }
    }
} 