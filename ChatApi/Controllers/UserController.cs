using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChatApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace ChatApi.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<User>>> GetUsers()
        {
            var users = await _userManager.Users.ToListAsync();
            return users.Select(u => new User
            {
                Id = u.Id,
                Name = u.UserName ?? string.Empty,
                UserName = u.UserName ?? string.Empty,
                Avatar = u.Avatar ?? string.Empty,
                Status = u.Status
            }).ToList();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<User>> GetUser(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            return new User
            {
                Id = user.Id,
                Name = user.UserName ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                Avatar = user.Avatar ?? string.Empty,
                Status = user.Status
            };
        }

        [HttpPost]
        public async Task<ActionResult<User>> CreateUser(User user)
        {
            var applicationUser = new ApplicationUser
            {
                UserName = user.UserName,
                Avatar = user.Avatar,
                Status = user.Status
            };
            await _userManager.CreateAsync(applicationUser);
            return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(string id, User user)
        {
            if (id != user.Id)
                return BadRequest();

            var applicationUser = await _userManager.FindByIdAsync(id);
            if (applicationUser == null)
                return NotFound();

            applicationUser.UserName = user.UserName;
            applicationUser.Avatar = user.Avatar;
            applicationUser.Status = user.Status;

            await _userManager.UpdateAsync(applicationUser);
            return NoContent();
        }
    }
}