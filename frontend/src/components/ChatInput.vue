<script setup>
  import { ref } from 'vue'
  const props = defineProps({
    onSend: {
      type: Function,
      required: true
    }
  });
  const inputMessage = ref("");
  async function submitMessage() {
    if (inputMessage.value.trim() === "") return;

    try {
      const success = await props.onSend(inputMessage.value);
      if (success) {
        inputMessage.value = "";
        console.log("Send a message completely:", inputMessage);
      }
    } catch (error) {
      console.error("Failed to send a message:", error);
    }
  }
</script>
<template>
  <form @submit.prevent="submitMessage">
    <input type="text"
           placeholder="メッセージを入力..."
           v-model="inputMessage" />
    <button type="submit" :disabled="inputMessage.trim() === ''">
      送信
    </button>
  </form>
</template>
