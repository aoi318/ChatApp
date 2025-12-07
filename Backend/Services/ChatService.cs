namespace Backend.Services
{
    public class ChatService : IChatService
    {
        private readonly List<ChatMessage> _messages = [];

        public Task AddMessageAsync(string user, string message)
        {
            var newMessage = new ChatMessage
            {
                User = user,
                Message = message,
                Timestamp = DateTime.Now
            };

            _messages.Add(newMessage);
            Console.WriteLine("AddMessageAsync");
            Console.WriteLine(_messages.Count);
            return Task.CompletedTask;
        }

        public Task<IReadOnlyList<ChatMessage>> GetHistoryAsync()
        {

            Console.WriteLine("GetHistoryAsync");
            Console.WriteLine(_messages.Count);
            return Task.FromResult((IReadOnlyList<ChatMessage>)_messages);
        }
    }
}
