// Services/IChatService.cs

namespace Backend.Services
{
    public class ChatMessage
    {
        public required string User { get; set; }
        public required string Message { get; set; }
        public DateTime Timestamp { get; set; }
    }

    public interface IChatService
    {
        Task AddMessageAsync(string user, string message);
        Task<IReadOnlyList<ChatMessage>> GetHistoryAsync();
    }
}
