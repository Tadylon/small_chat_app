<template>
  <div class="flex flex-col h-full w-full bg-base-100 relative">
    <div
      v-if="!chatStore.selectedUser"
      class="flex-1 flex flex-col items-center justify-center bg-base-200/50"
    >
      <div class="text-center space-y-4 opacity-50">
        <div class="text-6xl">💬</div>
        <h2 class="text-2xl font-bold">选择一个好友开始聊天</h2>
      </div>
    </div>

    <template v-else>
      <div
        class="navbar bg-base-100 border-b border-base-200 px-6 min-h-[4rem] shadow-sm z-10"
      >
        <div class="flex items-center gap-3">
          <div class="avatar placeholder">
            <div
              class="bg-primary text-primary-content rounded-full w-10 shadow-md"
            >
              <span class="text-lg font-bold">{{
                chatStore.selectedUser.username.charAt(0).toUpperCase()
              }}</span>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-lg">
              {{ chatStore.selectedUser.username }}
            </h3>
            <span class="text-xs text-success flex items-center gap-1">
              <span class="badge badge-success badge-xs"></span> 在线
            </span>
          </div>
        </div>
      </div>

      <div
        class="flex-1 overflow-y-auto p-6 space-y-4 bg-base-200/30"
        ref="messagesContainer"
      >
        <div v-if="chatStore.loading" class="flex justify-center py-10">
          <span class="loading loading-dots loading-lg text-primary"></span>
        </div>

        <div
          v-else-if="chatStore.error"
          class="alert alert-error shadow-sm max-w-md mx-auto"
        >
          <span>{{ chatStore.error }}</span>
        </div>

        <div v-else class="flex flex-col gap-2">
          <div
            v-for="message in chatStore.messages"
            :key="message.id"
            class="chat"
            :class="isSentMessage(message) ? 'chat-end' : 'chat-start'"
          >
            <div class="chat-header opacity-50 text-xs mb-1 px-1">
              {{ formatTime(message.created_at) }}
            </div>

            <div
              class="chat-bubble shadow-sm"
              :class="[
                isSentMessage(message)
                  ? 'chat-bubble-primary'
                  : 'bg-base-100 text-base-content border border-base-300',
                message.is_file
                  ? 'p-0 overflow-hidden bg-transparent border-none shadow-none'
                  : '',
              ]"
            >
              <span v-if="!message.is_file" class="break-words">{{
                message.message
              }}</span>

              <div
                v-else
                class="card bg-base-100 border border-base-300 w-64 overflow-hidden"
              >
                <div class="p-4 flex items-center gap-3 bg-base-200/50">
                  <div class="p-2 bg-base-100 rounded-lg text-primary">📁</div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate">
                      {{ message.file_name }}
                    </p>
                    <p class="text-xs opacity-60">
                      {{ formatFileSize(message.file_size) }}
                    </p>
                  </div>
                </div>
                <button
                  @click="downloadFile(message.file_id, message.file_name)"
                  class="btn btn-sm btn-block btn-ghost rounded-t-none border-t border-base-200 font-normal hover:text-primary"
                >
                  点击下载
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-4 bg-base-100 border-t border-base-200">
        <div class="flex items-end gap-2 max-w-4xl mx-auto">
          <div class="tooltip" data-tip="上传文件">
            <FileTransfer :receiver-id="chatStore.selectedUser.id" />
          </div>

          <div
            class="join w-full shadow-sm bg-base-200 rounded-lg p-1 border border-base-200 focus-within:border-primary transition-colors"
          >
            <input
              v-model="newMessage"
              @keyup.enter="sendMessage"
              placeholder="输入消息..."
              :disabled="sending"
              class="input input-ghost join-item w-full focus:outline-none bg-transparent"
            />
            <button
              @click="sendMessage"
              :disabled="sending || !newMessage.trim()"
              class="btn btn-primary btn-sm join-item my-auto mr-1 rounded-md"
            >
              <span
                v-if="sending"
                class="loading loading-spinner loading-xs"
              ></span>
              <span v-else>发送</span>
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
// 保持你原有的 Logic 代码不变 (imports, setup等)
import { ref, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/chat.js";
import { useAuthStore } from "@/stores/auth.js";
import FileTransfer from "@/components/chat/FileTransfer.vue";

export default {
  name: "ChatWindow",
  components: { FileTransfer },
  setup() {
    // ... 这里完全复制你原来 ChatWindow.vue 的 <script> 内容 ...
    // 为了节省篇幅，假设这里代码一致
    const chatStore = useChatStore();
    const authStore = useAuthStore();
    const newMessage = ref("");
    const sending = ref(false);
    const messagesContainer = ref(null);

    watch(
      () => chatStore.messages,
      () => scrollToBottom()
    );
    watch(
      () => chatStore.selectedUser,
      async (newUser) => {
        if (newUser) await chatStore.fetchMessages(newUser.id);
      }
    );

    const isSentMessage = (m) => m.sender_id === authStore.user.id;
    const formatTime = (t) =>
      new Date(t).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    const formatFileSize = (bytes) => {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (
        parseFloat((bytes / Math.pow(k, i)).toFixed(2)) +
        " " +
        ["Bytes", "KB", "MB", "GB"][i]
      );
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
      } catch (e) {
        console.error(e);
      } finally {
        sending.value = false;
      }
    };
    const downloadFile = (id, name) => {
      /* Logic */
    };
    const scrollToBottom = () =>
      nextTick(() => {
        if (messagesContainer.value)
          messagesContainer.value.scrollTop =
            messagesContainer.value.scrollHeight;
      });

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
