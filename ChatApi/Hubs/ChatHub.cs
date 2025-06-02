using Microsoft.AspNetCore.SignalR;
using ChatApi.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace ChatApi.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly ChatDbContext _context;

        public ChatHub(ChatDbContext context)
        {
            _context = context;
        }

        public async Task SendMessage(Message message)
        {
            var senderId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(senderId))
            {
                throw new HubException("Unauthorized");
            }

            // Don't create a new message, just broadcast the existing one
            // The message should already be saved by the MessageController
            await Clients.Users(new[] { message.SenderId, message.ReceiverId })
                .SendAsync("ReceiveMessage", message);
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    // Check if connection already exists
                    var existingConnection = await _context.ChatConnections
                        .FirstOrDefaultAsync(c => c.UserId == userId && c.ConnectionId == Context.ConnectionId);

                    if (existingConnection == null)
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
                        
                        await Clients.All.SendAsync("UserJoined", new
                        {
                            id = user.Id,
                            name = user.UserName,
                            status = user.Status,
                            avatar = user.Avatar
                        });
                    }
                }
            }
            await base.OnConnectedAsync();
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
                    await _context.SaveChangesAsync();
                    
                    await Clients.All.SendAsync("UserLeft", new
                    {
                        id = connection.User.Id,
                        name = connection.User.UserName,
                        status = "offline",
                        avatar = connection.User.Avatar
                    });
                }
                
                await _context.SaveChangesAsync();
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}