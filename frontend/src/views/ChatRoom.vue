<script setup>
  import { useChatStore } from '../stores/chatStore';
  import { storeToRefs } from 'pinia'
  import ChatInput from '../components/ChatInput.vue';

  const chatStore = useChatStore();
  const { messages, isConnected, currentUser } = storeToRefs(chatStore);

  const { sendMessage } = chatStore;
</script>
 
<template>
  <div class="chat-room-container">

    <ul class="message-list">
    <li v-for="(item, index) in messages" :key="index">
      <strong>{{ item.user }}</strong>: <span>{{ item.message }}</span>
      <span class="timestamp">{{ item.timestamp }}</span>
      </li>
    </ul>

    <ChatInput :onSend="sendMessage" />
  </div>
</template>
