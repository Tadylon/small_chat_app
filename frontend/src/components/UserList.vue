<template>
  <div class="user-list">
    <h3>Online Users</h3>
    <div v-if="chatStore.loading" class="loading">Loading users...</div>
    <div v-else-if="chatStore.error" class="error">
      {{ chatStore.error }}
    </div>
    <ul v-else class="users">
      <li
        v-for="user in chatStore.users"
        :key="user.id"
        :class="{
          active:
            chatStore.selectedUser && chatStore.selectedUser.id === user.id,
        }"
        @click="selectUser(user)"
      >
        <span class="username">{{ user.username }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useChatStore } from "../stores/chat.js";

export default {
  name: "UserList",
  emits: ["user-selected"],
  setup(props, { emit }) {
    const chatStore = useChatStore();

    // Fetch users when component mounts
    onMounted(async () => {
      try {
        await chatStore.fetchUsers();
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    });

    const selectUser = (user) => {
      chatStore.selectUser(user);
      emit("user-selected", user);
    };

    return {
      chatStore,
      selectUser,
    };
  },
};
</script>

<style scoped></style>
