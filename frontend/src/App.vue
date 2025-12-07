<script setup>
  import { onMounted } from 'vue';
  import { useChatStore } from './stores/chatStore';
  import { storeToRefs } from 'pinia';
  import ChatRoom from './views/ChatRoom.vue';

  const chatStore = useChatStore();

  const { isConnected, currentUser } = storeToRefs(chatStore);

  onMounted(() => {
    chatStore.connect();
  });
</script>

<template>
  <div id="app">
    <p :style="{ color: isConnected ? 'green' : 'red' }">
      {{ isConnected ? '接続中' : '切断中' }} (User: {{ currentUser }})
    </p>

    <ChatRoom />
  </div>
</template>
