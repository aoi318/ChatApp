import { setActivePinia, createPinia } from 'pinia';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { useChatStore } from './chatStore';

// --- SignalR モック設定 ---

const mockConnection = {
  start: vi.fn(() => Promise.resolve()),
  on: vi.fn(),
  onclose: vi.fn(),
  onreconnected: vi.fn(),
  invoke: vi.fn((methodName) => {
    if (methodName === "GetHistory") {
      return Promise.resolve([{
        user: "Dummy",
        message: "History message",
        timestamp: "2025-01-01T00:00:00Z"
      }]);
    }
    return Promise.resolve();
  }),
};

const mockHubConnectionBuilder = {
  withUrl: vi.fn().mockReturnThis(),
  withAutomaticReconnect: vi.fn().mockReturnThis(),
  configureLogging: vi.fn().mockReturnThis(),
  build: vi.fn(() => mockConnection),
};

vi.mock('@microsoft/signalr', () => {
  const MockBuilder = vi.fn(function () {
    return mockHubConnectionBuilder;
  });

  return {
    HubConnectionBuilder: MockBuilder,
    LogLevel: { Information: 1 },
  };
});


beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
  mockConnection.invoke.mockRestore()
});

describe('chatStore Tests', () => {
  it('Checks initial state', () => {
    const store = useChatStore();
    expect(store.isConnected).toBe(false);
    expect(store.messages.length).toBe(0);
    expect(store.currentUser).not.toBeNull();
    expect(store.currentUser).toMatch(/^User\d+$/);
  });

  it('Addmessage works correctly', () => {
    const store = useChatStore();
    store.addMessage('TestUser', 'TestMessage');

    expect(store.messages.length).toBe(1);
    expect(store.messages[0].user).toBe('TestUser');
  });

  it('connect works correctly', async () => {
    const store = useChatStore();
    store.getHistory = vi.fn(() => Promise.resolve());

    await store.connect();

    expect(mockConnection.start).toHaveBeenCalledTimes(1);
    expect(mockConnection.on).toHaveBeenCalledTimes(1);
    expect(mockConnection.on).toHaveBeenCalledWith("ReceiveMessage", expect.any(Function));
    expect(store.getHistory).toHaveBeenCalledTimes(1);
    expect(store.isConnected).toBe(true);
  });

  it('connection failure', async () => {
    mockConnection.start.mockRejectedValueOnce(new Error("Simulated connection failed"));
    const store = useChatStore();

    await store.connect();

    expect(mockConnection.start).toHaveBeenCalledTimes(1);
    expect(store.isConnected).toBe(false);
  });

  it('getHistory() should load messages and replace state', async () => {
    const store = useChatStore();
    store.isConnected = true;
    store.messages = [{ user: "Old", message: "Old", timestamp: "10:00 AM" }];

    await store.getHistory();

    expect(mockConnection.invoke).toHaveBeenCalledWith("GetHistory");

    expect(store.messages.length).toBe(1);
    expect(store.messages[0].user).toBe("Dummy");
    expect(typeof store.messages[0].timestamp).toBe('string');
    expect(store.messages[0].timestamp).not.toBe("2025-01-01T00:00:00Z");
  });

  it('sendMessage() should call invoke only when connected and message is not empty', async () => {
    const store = useChatStore();
    store.isConnected = true;

    await store.sendMessage("New message");
    await store.sendMessage("   ");

    store.isConnected = false;
    await store.sendMessage("Another message");

    expect(mockConnection.invoke).toHaveBeenCalledWith("SendMessage", store.currentUser, "New message");
    expect(mockConnection.invoke).toHaveBeenCalledTimes(1);
    expect(mockConnection.invoke).not.toHaveBeenCalledWith(
      "SendMessage",
      store.currentUser,
      "   "
    );
  });
})
