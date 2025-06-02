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
        public required string UserName { get; set; }
        
        [Required]
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        
        [MaxLength(100)]
        public string Avatar { get; set; } = "https://i.pinimg.com/originals/51/f6/fb/51f6fb256629fc755b8870c801092942.png";
        
        public string Status { get; set; } = "offline";
        
        [JsonIgnore]
        public virtual ICollection<Message> SentMessages { get; set; } = [];
        
        [JsonIgnore]
        public virtual ICollection<ChatConnection> Connections { get; set; } = [];
    }
}