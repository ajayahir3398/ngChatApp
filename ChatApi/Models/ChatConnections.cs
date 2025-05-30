using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ChatApi.Models
{
    public class ChatConnection
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        public required string UserId { get; set; }
        
        [ForeignKey("UserId")]
        public required virtual User User { get; set; }
        
        [Required]
        public required string ConnectionId { get; set; }
        
        public DateTime Connected { get; set; } = DateTime.UtcNow;
    }
}