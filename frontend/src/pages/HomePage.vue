<template>
  <div class="home-page">
    <div class="header">
      <div class="header-left">
        <img src="../assets/header.jpg" alt="Chat App Logo" class="header-logo" />
        <h1>Chat App</h1>
        <nav class="nav-links">
          <router-link to="/" class="nav-link">私聊</router-link>
          <router-link to="/groups" class="nav-link">群聊</router-link>
        </nav>
      </div>
      <div class="user-info">
        <span>Welcome, {{ authStore.user?.username || 'User' }}!</span>
        <button @click="handleLogout">Logout</button>
      </div>
    </div>
    <!-- 私聊界面 -->
    <div v-if="$route.path === '/'" class="chat-container">
      <UserList @user-selected="onUserSelected" />
      <ChatWindow />
    </div>

    <!-- 群聊界面 -->
    <div v-else class="group-chat-container">
      <router-view />
    </div>
  </div>
</template>

<script>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import UserList from '../components/UserList.vue';
import ChatWindow from '../components/ChatWindow.vue';
import { useAuthStore } from '../stores/auth.js';
import { useChatStore } from '../stores/chat.js';

export default {
  name: 'HomePage',
  components: {
    UserList,
    ChatWindow
  },
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const chatStore = useChatStore();

    // Check if user is authenticated
    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        try {
          await authStore.fetchCurrentUser();
        } catch (error) {
          // If we can't fetch the current user, redirect to login
          router.push('/login');
        }
      }
    });

    const handleLogout = async () => {
      try {
        await authStore.logout();
        // Clear chat store
        chatStore.clearMessages();
        // Redirect to login page
        router.push('/login');
      } catch (error) {
        console.error('Logout failed:', error);
      }
    };

    const onUserSelected = () => {
      // User selection handled in ChatWindow component
    };

    return {
      authStore,
      handleLogout,
      onUserSelected
    };
  }
};
</script>

<style scoped>
.home-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 25px;
}

.header-logo {
  height: 50px;
  width: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  padding: 10px 20px;
  border-radius: 30px;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-link:hover,
.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  transform: translateY(-2px);
}

.header h1 {
  margin: 0;
  color: white;
  font-weight: 600;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-info span {
  font-weight: 500;
}

.user-info button {
  padding: 10px 20px;
  background: linear-gradient(120deg, #dc3545, #e83e8c);
  color: white;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
}

.user-info button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.chat-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.group-chat-container {
  flex: 1;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
}
</style>