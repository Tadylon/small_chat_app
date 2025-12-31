<template>
  <div class="h-full bg-base-200 border-r border-base-300 flex flex-col w-64">
    <div class="p-4 border-b border-base-300">
      <h3 class="font-bold text-lg flex items-center gap-2">Online Users</h3>
    </div>

    <div class="flex-1 overflow-y-auto p-2">
      <div v-if="chatStore.loading" class="flex justify-center p-4">
        <span class="loading loading-spinner text-primary"></span>
      </div>

      <div v-else-if="chatStore.error" class="alert alert-error text-sm">
        <span>{{ chatStore.error }}</span>
      </div>

      <ul v-else class="menu w-full rounded-box gap-1">
        <li v-for="user in chatStore.users" :key="user.id">
          <a
            @click="selectUser(user)"
            :class="{
              active:
                chatStore.selectedUser && chatStore.selectedUser.id === user.id,
            }"
            class="flex items-center gap-3"
          >
            <div class="avatar placeholder">
              <div class="bg-neutral text-neutral-content rounded-full w-8">
                <span class="text-xs">{{
                  user.username.charAt(0).toUpperCase()
                }}</span>
              </div>
            </div>

            <span class="font-medium truncate">{{ user.username }}</span>

            <span class="badge badge-success badge-xs ml-auto"></span>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { onMounted } from "vue";
import { useChatStore } from "@/stores/chat.js";

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
