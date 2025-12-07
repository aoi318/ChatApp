using Backend.Services;

namespace Backend.Tests
{
    public class UnitTest1
    {
        [Fact]
        public async Task Test1()
        {
            var chatService = new ChatService();

            await chatService.AddMessageAsync("user1", "Hello, World!");
            var history = await chatService.GetHistoryAsync();

            Assert.Equal("user1", history[0].User);
            Assert.Equal("Hello, World!", history[0].Message);
            Assert.Single(history);
        }
    }
}
