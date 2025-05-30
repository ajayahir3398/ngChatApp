using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ChatApi.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        
        [Required]
        [MaxLength(50)]
        public required string Name { get; set; }
        
        [Required]
        [MaxLength(50)]
        public required string Username { get; set; }
        
        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public required string Avatar { get; set; }
        
        public string Status { get; set; } = "offline";
        
        [JsonIgnore]
        public virtual ICollection<Message> SentMessages { get; set; } = [];
        
        [JsonIgnore]
        public virtual ICollection<ChatConnection> Connections { get; set; } = [];
    }
}