using Backend.Services;
using Microsoft.AspNetCore.SignalR;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace Backend.Tests
{
    public class ChatHubTests
    {
        private readonly Mock<IChatService> _chatServiceMock;
        private readonly Mock<IHubCallerClients> _clientsMock;
        private readonly Mock<IClientProxy> _clientProxyMock;

        public ChatHubTests()
        {
            _chatServiceMock = new Mock<IChatService>();
            _clientsMock = new Mock<IHubCallerClients>();
            _clientProxyMock = new Mock<IClientProxy>();
        }

        [Fact]
        public async Task AddMessageAsyncTest()
        {
            var chatHub = new ChatHub(_chatServiceMock.Object);
            chatHub.Clients = _clientsMock.Object;

            _clientsMock.Setup(c => c.All).Returns(_clientProxyMock.Object);
            _chatServiceMock.Setup(s => s.AddMessageAsync(It.IsAny<string>(), It.IsAny<string>())).Returns(Task.CompletedTask);

            await chatHub.SendMessage("user1", "Hello World");

            _chatServiceMock.Verify(x => x.AddMessageAsync("user1", "Hello World"), Times.Once);
            _clientProxyMock.Verify(x => x.SendCoreAsync("ReceiveMessage", It.Is<object[]>(o => (string)o[0] == "user1" && (string)o[1] == "Hello World"), default), Times.Once);
        }
    }
}
