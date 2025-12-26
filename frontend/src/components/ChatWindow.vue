<template>
  <div class="chat-window">
    <div v-if="!chatStore.selectedUser" class="no-chat-selected">
      <p>Select a user to start chatting</p>
    </div>
    <template v-else>
      <div class="chat-header">
        <h3>{{ chatStore.selectedUser.username }}</h3>
      </div>
      <div class="messages-container" ref="messagesContainer">
        <div v-if="chatStore.loading" class="loading">Loading messages...</div>
        <div v-else-if="chatStore.error" class="error">
          {{ chatStore.error }}
        </div>
        <div v-else class="messages">
          <div
            v-for="message in chatStore.messages"
            :key="message.id"
            :class="[
              'message',
              { sent: isSentMessage(message), 'file-message': message.is_file },
            ]"
          >
            <div class="sender-name" v-if="!isSentMessage(message)">
              {{ message.sender_name }}
            </div>
            <div class="message-content" v-if="!message.is_file">
              {{ message.message }}
            </div>
            <div class="file-message-content" v-else>
              <div class="file-info">
                <strong>File Transfer:</strong> {{ message.file_name }}
                <span class="file-size"
                  >({{ formatFileSize(message.file_size) }})</span
                >
              </div>
              <div class="file-actions">
                <a
                  :href="`http://localhost:3000/api/file/download/${message.file_id}`"
                  target="_blank"
                  class="download-link"
                  @click.prevent="
                    downloadFile(message.file_id, message.file_name)
                  "
                >
                  Download
                </a>
              </div>
            </div>
            <div class="message-time">
              {{ formatTime(message.created_at) }}
            </div>
          </div>
        </div>
      </div>
      <div class="message-input">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          placeholder="Type your message..."
          :disabled="sending"
        />
        <button @click="sendMessage" :disabled="sending || !newMessage.trim()">
          {{ sending ? "Sending..." : "Send" }}
        </button>
        <FileTransfer :receiver-id="chatStore.selectedUser.id" />
      </div>
    </template>
  </div>
</template>

<script>
import { ref, watch, nextTick } from "vue";
import { useChatStore } from "../stores/chat.js";
import { useAuthStore } from "../stores/auth.js";
import FileTransfer from "./FileTransfer.vue";

export default {
  name: "ChatWindow",
  components: {
    FileTransfer,
  },
  setup() {
    const chatStore = useChatStore();
    const authStore = useAuthStore();
    const newMessage = ref("");
    const sending = ref(false);
    const messagesContainer = ref(null);

    // Watch for changes in messages and scroll to bottom
    watch(
      () => chatStore.messages,
      () => {
        scrollToBottom();
      }
    );

    // Watch for changes in selected user and fetch messages
    watch(
      () => chatStore.selectedUser,
      async (newUser) => {
        if (newUser) {
          try {
            await chatStore.fetchMessages(newUser.id);
          } catch (error) {
            console.error("Failed to fetch messages:", error);
          }
        }
      }
    );

    const isSentMessage = (message) => {
      return message.sender_id === authStore.user.id;
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();

      // If the message was sent today, show only time
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      // If the message was sent yesterday, show "Yesterday" and time
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}`;
      }

      // For older messages, show date and time
      return date.toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim() || sending.value) return;

      sending.value = true;
      try {
        await chatStore.sendMessage({
          receiverId: chatStore.selectedUser.id,
          message: newMessage.value.trim(),
        });
        newMessage.value = "";
      } catch (error) {
        console.error("Failed to send message:", error);
      } finally {
        sending.value = false;
      }
    };

    const downloadFile = (fileId, fileName) => {
      const link = document.createElement("a");
      link.href = `http://localhost:3000/api/file/download/${fileId}`;
      link.target = "_blank";
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
        }
      });
    };

    return {
      chatStore,
      newMessage,
      sending,
      messagesContainer,
      isSentMessage,
      formatTime,
      formatFileSize,
      sendMessage,
      downloadFile,
    };
  },
};
</script>

<style scoped></style>
