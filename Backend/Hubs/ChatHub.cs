// Hubs/ChatHub.cs

using Backend.Services;
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

public class ChatHub : Hub
{
    private readonly IChatService _chatService;

    [ActivatorUtilitiesConstructor]
    public ChatHub(IChatService chatService)
    {
        _chatService = chatService;
        
    }
    public async Task SendMessage(string user, string message)
    {
        await _chatService.AddMessageAsync(user, message);
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }

    public async Task<List<ChatMessage>> GetHistory()
    {
        var history = await _chatService.GetHistoryAsync();
        return history.ToList();
    }

    public override async Task OnConnectedAsync()
    {
        Console.WriteLine($"Client connected: {Context.ConnectionId}");
        await base.OnConnectedAsync();
    }
}