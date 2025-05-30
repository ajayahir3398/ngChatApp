using Microsoft.AspNetCore.SignalR;
using ChatApi.Models;
using Microsoft.EntityFrameworkCore;

namespace ChatApi.Hubs
{
    public class ChatHub : Hub
    {
        private readonly ChatDbContext _context;

        public ChatHub(ChatDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(Message message)
        {
            _context.Messages.Add(message);
            await _context.SaveChangesAsync();
            await Clients.All.SendAsync("ReceiveMessage", message);
        }

        public async Task JoinChat(string userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                var connection = new ChatConnection
                {
                    UserId = userId,
                    ConnectionId = Context.ConnectionId,
                    User = user
                };
                
                _context.ChatConnections.Add(connection);
                user.Status = "online";
                await _context.SaveChangesAsync();
                
                await Clients.All.SendAsync("UserJoined", user);
            }
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var connection = await _context.ChatConnections
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.ConnectionId == Context.ConnectionId);

            if (connection != null)
            {
                _context.ChatConnections.Remove(connection);
                
                // Only set user offline if they have no other active connections
                var hasOtherConnections = await _context.ChatConnections
                    .AnyAsync(c => c.UserId == connection.UserId && c.ConnectionId != Context.ConnectionId);
                
                if (!hasOtherConnections)
                {
                    connection.User.Status = "offline";
                    await Clients.All.SendAsync("UserLeft", connection.User);
                }
                
                await _context.SaveChangesAsync();
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}