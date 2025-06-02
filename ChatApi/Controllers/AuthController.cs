using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChatApi.Models;
using ChatApi.Services;
using Microsoft.AspNetCore.Identity;

namespace ChatApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ChatDbContext _context;
        private readonly AuthService _authService;
        private readonly UserManager<ApplicationUser> _userManager;

        public AuthController(
            ChatDbContext context, 
            AuthService authService,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _authService = authService;
            _userManager = userManager;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            if (await _userManager.FindByNameAsync(request.UserName) != null)
                return BadRequest("UserName already exists");

            var user = new ApplicationUser
            {
                UserName = request.UserName,
                Avatar = request.Avatar,
                Status = "offline"
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors.First().Description);

            return new AuthResponse
            {
                Token = _authService.GenerateJwtToken(user),
                User = new User
                {
                    Id = user.Id,
                    Name = user.UserName ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    Avatar = user.Avatar ?? string.Empty,
                    Status = user.Status ?? string.Empty
                }
            };
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            var user = await _userManager.FindByNameAsync(request.UserName);
            if (user == null)
                return Unauthorized("Invalid username or password");

            var isValid = await _userManager.CheckPasswordAsync(user, request.Password);
            if (!isValid)
                return Unauthorized("Invalid username or password");

            return new AuthResponse
            {
                Token = _authService.GenerateJwtToken(user),
                User = new User
                {
                    Id = user.Id,
                    Name = user.UserName ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    Avatar = user.Avatar ?? string.Empty,
                    Status = user.Status ?? string.Empty
                }
            };
        }
    }
}