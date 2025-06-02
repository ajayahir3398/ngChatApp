using System.ComponentModel.DataAnnotations;

namespace ChatApi.Models
{
    public class LoginRequest
    {
        [Required]
        public required string UserName { get; set; }
        
        [Required]
        public required string Password { get; set; }
    }

    public class RegisterRequest
    {
        [Required]
        [MinLength(3)]
        public required string UserName { get; set; }
        
        [Required]
        [MinLength(6)]
        public required string Password { get; set; }
        
        [MaxLength(100)]
        public required string Avatar { get; set; }
    }

    public class AuthResponse
    {
        public required string Token { get; set; }
        public required User User { get; set; }
    }
}