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
        public string Content { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        [Required]
        public required string SenderId { get; set; }

        [Required]
        public required string ReceiverId { get; set; }

        [ForeignKey("SenderId")]
        public virtual ApplicationUser Sender { get; set; } = null!;

        [ForeignKey("ReceiverId")]
        public virtual ApplicationUser Receiver { get; set; } = null!;

        [NotMapped]
        public string SenderName => Sender?.UserName ?? "Unknown";
    }
} 