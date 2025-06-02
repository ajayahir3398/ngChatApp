using Microsoft.AspNetCore.Identity;

namespace ChatApi.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? Avatar { get; set; }
        public string Status { get; set; } = "offline";
    }
} 