import { defineStore } from 'pinia';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const CHAT_HUB_URL = 'https://localhost:7099/chathub';
let connection = null;

export const useChatStore = defineStore('chat', {
  state: () => ({
    isConnected: false,
    messages: [],
    currentUser: 'User' + Math.floor(Math.random() * 1000),
  }),

  actions: {
    addMessage(user, message) {
      this.messages.push({
        user: user,
        message: message,
        timestamp: new Date().toLocaleTimeString(),
      })
    },

    async connect() {
      if (this.isConnected && connection) return;

      connection = new HubConnectionBuilder()
        .withUrl(CHAT_HUB_URL, { withCredentials: true })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      connection.on("ReceiveMessage", this.addMessage);

      connection.onclose(() => {
        this.isConnected = false;
        console.log("SignalR disconnected");
      });

      try {
        await connection.start();
        this.isConnected = true;
        await this.getHistory();
        console.log("SignalR connected. User:", this.currentUser);

        connection.onreconnected(async () => {
          await this.getHistory();
          this.isConnected = true;
        });
      } catch (error) {
        this.isConnected = false;
        console.error("SignalR 接続エラー:", error);
      }
    },

    async sendMessage(message) {
      if (this.isConnected && connection && message.trim()) {
        try {
          await connection.invoke("SendMessage", this.currentUser, message);
          return true;
        }
        catch (error) {
          console.error("送信エラー:", error)
          return false;
        }
      }
    },

    async getHistory() {
      if (this.isConnected && connection) {
        try {
          const history = await connection.invoke("GetHistory");
          this.messages = history.map(item => ({
            user: item.user,
            message: item.message,
            timestamp: new Date(item.timestamp).toLocaleTimeString()
          }));
          console.log("Success to get messages");
        } catch (error) {
          console.error("Failed to get messages:", error);
        }
      }
    },
  }
})
