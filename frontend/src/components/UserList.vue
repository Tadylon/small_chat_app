<template>
  <div class="user-list">
    <h3>Online Users</h3>
    <div v-if="chatStore.loading" class="loading">
      Loading users...
    </div>
    <div v-else-if="chatStore.error" class="error">
      {{ chatStore.error }}
    </div>
    <ul v-else class="users">
      <li
        v-for="user in chatStore.users"
        :key="user.id"
        :class="{ active: chatStore.selectedUser && chatStore.selectedUser.id === user.id }"
        @click="selectUser(user)"
      >
        <span class="username">{{ user.username }}</span>
      </li>
    </ul>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useChatStore } from '../stores/chat.js';

export default {
  name: 'UserList',
  emits: ['user-selected'],
  setup(props, { emit }) {
    const chatStore = useChatStore();

    // Fetch users when component mounts
    onMounted(async () => {
      try {
        await chatStore.fetchUsers();
      } catch (error) {
        console.error('Failed to fetch users:', error);
      }
    });

    const selectUser = (user) => {
      chatStore.selectUser(user);
      emit('user-selected', user);
    };

    return {
      chatStore,
      selectUser
    };
  }
};
</script>

<style scoped>
.user-list {
  height: 100%;
  border-right: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
}

h3 {
  padding: 20px;
  margin: 0;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  font-weight: 500;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading, .error {
  padding: 20px;
  text-align: center;
}

.error {
  color: #dc3545;
}

.users {
  list-style: none;
  padding: 0;
  margin: 0;
}

.users li {
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.users li:before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #6c757d;
  margin-right: 12px;
}

.users li:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: translateX(5px);
}

.users li.active {
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
}

.users li.active:before {
  background-color: #28a745;
}

.users li.active:hover {
  transform: translateX(5px);
}

.username {
  font-weight: 500;
}
</style>