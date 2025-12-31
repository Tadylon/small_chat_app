import { defineStore } from "pinia";
import api from "@/services/api.js";

export const useChatStore = defineStore("chat", {
  state: () => ({
    users: [],
    messages: [],
    selectedUser: null,
    loading: false,
    error: null,
  }),

  getters: {
    getMessages: (state) => state.messages,
    getUsers: (state) => state.users,
    getSelectedUser: (state) => state.selectedUser,
  },

  actions: {
    async fetchUsers() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getUsers();
        this.users = response.data;
        this.loading = false;
      } catch (error) {
        this.error = error.message || "Failed to fetch users";
        this.loading = false;
        throw error;
      }
    },

    async sendMessage(messageData) {
      try {
        const response = await api.sendMessage(messageData);
        // Add message to local state
        this.messages.push(response.data);
        return response;
      } catch (error) {
        this.error = error.message || "Failed to send message";
        throw error;
      }
    },

    async fetchMessages(userId) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.getMessages(userId);
        this.messages = response.data;
        this.selectedUser =
          this.users.find((user) => user.id == userId) || null;
        this.loading = false;
      } catch (error) {
        this.error = error.message || "Failed to fetch messages";
        this.loading = false;
        throw error;
      }
    },

    selectUser(user) {
      this.selectedUser = user;
    },

    clearMessages() {
      this.messages = [];
      this.selectedUser = null;
    },

    // Add a file message to the chat
    addFileMessage(fileData, receiverId) {
      const fileMessage = {
        id: Date.now(), // Temporary ID
        sender_id: null, // Will be set by backend
        receiver_id: receiverId,
        message: `File sent: ${fileData.fileName}`,
        is_file: true,
        file_name: fileData.fileName,
        file_size: fileData.fileSize,
        file_id: fileData.fileId,
        created_at: new Date().toISOString(),
      };

      this.messages.push(fileMessage);
    },
  },
});
