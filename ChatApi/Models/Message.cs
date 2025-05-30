using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApi.Models
{
    public class Message
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public required string SenderId { get; set; }
        
        [ForeignKey("SenderId")]
        public required virtual User Sender { get; set; }
        
        public required string Content { get; set; }
        
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        
        [NotMapped]
        public string SenderName => Sender?.Name ?? "Unknown";
    }
} 