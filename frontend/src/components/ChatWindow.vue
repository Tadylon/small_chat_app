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
        <div v-if="chatStore.loading" class="loading">
          Loading messages...
        </div>
        <div v-else-if="chatStore.error" class="error">
          {{ chatStore.error }}
        </div>
        <div v-else class="messages">
          <div
            v-for="message in chatStore.messages"
            :key="message.id"
            :class="['message', { 'sent': isSentMessage(message), 'file-message': message.is_file }]"
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
                <span class="file-size">({{ formatFileSize(message.file_size) }})</span>
              </div>
              <div class="file-actions">
                <a :href="`http://localhost:3000/api/file/download/${message.file_id}`"
                   target="_blank"
                   class="download-link"
                   @click.prevent="downloadFile(message.file_id, message.file_name)">
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
          {{ sending ? 'Sending...' : 'Send' }}
        </button>
        <FileTransfer :receiver-id="chatStore.selectedUser.id" />
      </div>
    </template>
  </div>
</template>

<script>
import { ref, watch, nextTick } from 'vue';
import { useChatStore } from '../stores/chat.js';
import { useAuthStore } from '../stores/auth.js';
import FileTransfer from './FileTransfer.vue';

export default {
  name: 'ChatWindow',
  components: {
    FileTransfer
  },
  setup() {
    const chatStore = useChatStore();
    const authStore = useAuthStore();
    const newMessage = ref('');
    const sending = ref(false);
    const messagesContainer = ref(null);

    // Watch for changes in messages and scroll to bottom
    watch(() => chatStore.messages, () => {
      scrollToBottom();
    });

    // Watch for changes in selected user and fetch messages
    watch(() => chatStore.selectedUser, async (newUser) => {
      if (newUser) {
        try {
          await chatStore.fetchMessages(newUser.id);
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      }
    });

    const isSentMessage = (message) => {
      return message.sender_id === authStore.user.id;
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const now = new Date();

      // If the message was sent today, show only time
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      // If the message was sent yesterday, show "Yesterday" and time
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }

      // For older messages, show date and time
      return date.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const sendMessage = async () => {
      if (!newMessage.value.trim() || sending.value) return;

      sending.value = true;
      try {
        await chatStore.sendMessage({
          receiverId: chatStore.selectedUser.id,
          message: newMessage.value.trim()
        });
        newMessage.value = '';
      } catch (error) {
        console.error('Failed to send message:', error);
      } finally {
        sending.value = false;
      }
    };

    const downloadFile = (fileId, fileName) => {
      const link = document.createElement('a');
      link.href = `http://localhost:3000/api/file/download/${fileId}`;
      link.target = '_blank';
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
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
      downloadFile
    };
  }
};
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

.no-chat-selected {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #6c757d;
  font-size: 1.2rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.chat-header h3 {
  margin: 0;
  font-weight: 500;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: rgba(248, 249, 250, 0.7);
}

.loading, .error {
  text-align: center;
  padding: 20px;
}

.error {
  color: #dc3545;
}

.messages {
  display: flex;
  flex-direction: column;
}

.message {
  max-width: 30%;
  padding: 12px 18px;
  margin-bottom: 15px;
  border-radius: 20px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.message.sent {
  align-self: flex-end;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  border-bottom-right-radius: 5px;
}

.message.received {
  align-self: flex-start;
  background: white;
  color: #212529;
  border-bottom-left-radius: 5px;
}

.message.file-message {
  max-width: 80%;
  background: #e3f2fd;
}

.message.sent .message.file-message {
  background: rgba(0, 123, 255, 0.2);
}

.sender-name {
  font-weight: bold;
  font-size: 0.85rem;
  margin-bottom: 5px;
  color: #007bff;
}

.message-content {
  word-wrap: break-word;
  line-height: 1.5;
}

.file-message-content {
  display: flex;
  flex-direction: column;
}

.file-info {
  margin-bottom: 8px;
  font-weight: 500;
}

.file-size {
  font-size: 0.8rem;
  opacity: 0.8;
}

.file-actions {
  margin-top: 5px;
}

.download-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
  display: inline-flex;
  align-items: center;
}

.download-link:hover {
  text-decoration: underline;
}

.message-time {
  font-size: 0.7rem;
  text-align: right;
  margin-top: 5px;
  opacity: 0.8;
}

.message.sent .message-time {
  color: rgba(255, 255, 255, 0.9);
}

.message.received .message-time {
  color: rgba(0, 0, 0, 0.6);
}

.message-input {
  display: flex;
  padding: 15px;
  border-top: 1px solid #e0e0e0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.message-input input {
  flex: 10;
  padding: 12px 20px;
  border: 1px solid #e0e0e0;
  border-radius: 30px;
  margin-right: 20px;
  outline: none;
  transition: border-color 0.3s;
}

.message-input input:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.message-input button {
  padding: 12px 25px;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  margin-right: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
  font-weight: 500;
}

.message-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.message-input button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
}
</style>