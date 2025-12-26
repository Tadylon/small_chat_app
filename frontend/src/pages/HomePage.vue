<template>
  <div class="home-page">
    <header class="header">
      <div class="header-left">
        <img
          src="../assets/header.jpg"
          alt="Chat App Logo"
          class="header-logo"
        />
        <h1>Chat App</h1>
        <nav class="header-nav-links">
          <router-link to="/" class="nav-link">私聊</router-link>
          <router-link to="/group" class="nav-link">群聊</router-link>
        </nav>
      </div>
      <div class="header-user-info">
        <span>Welcome, {{ authStore.user?.username || "User" }}!</span>
        <button @click="handleLogout">Logout</button>
      </div>
    </header>
    <!-- 私聊界面 -->
    <div v-if="$route.path === '/'" class="private-chat-container">
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
import { onMounted, computed } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router"; // 导入 useRoute 和 RouterLink
import UserList from "../components/UserList.vue";
import ChatWindow from "../components/ChatWindow.vue";
import { useAuthStore } from "../stores/auth.js";
import { useChatStore } from "../stores/chat.js";

export default {
  name: "HomePage",
  components: {
    UserList,
    ChatWindow,
    RouterLink, // 如果模板中使用了 RouterLink，则需要在这里注册
  },
  setup() {
    const router = useRouter(); // 1. 获取路由实例
    const route = useRoute(); // 引入 useRoute
    const authStore = useAuthStore();
    const chatStore = useChatStore();

    // 2. 计算属性：判断私聊按钮是否激活
    const isChatActive = computed(() => route.path === "/");
    // 3. 计算属性：判断群聊按钮是否激活
    const isGroupActive = computed(() => route.path.startsWith("/group"));
    // Check if user is authenticated
    onMounted(async () => {
      if (!authStore.isAuthenticated) {
        try {
          const isAuthenticated = await authStore.checkAuthStatus();
          if (!isAuthenticated) {
            // If we can't authenticate, redirect to login
            router.push("/login");
          }
        } catch (error) {
          // If we can't authenticate, redirect to login
          router.push("/login");
        }
      }
    });

    const handleLogout = async () => {
      try {
        await authStore.logout(); // Clear chat store
        chatStore.clearMessages(); // Redirect to login page
        router.push("/login");
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    const onUserSelected = () => {
      // User selection handled in ChatWindow component
    };

    return {
      authStore,
      handleLogout,
      onUserSelected,
      // 暴露计算属性给模板
      isChatActive,
      isGroupActive,
    };
  },
};

<style lang="scss" scoped>
  /* Variables */
  .home-page {
    /* Colors */
    --color-primary: #3b82f6;
    --color-text-main: #1f2937;
    --color-text-light: #6b7280;
    --color-bg-header: #ffffff;
    --color-bg-body: #f3f4f6;
    --color-border: #e5e7eb;
    --color-danger: #ef4444;

    /* Spacing (4px grid) */
    --space-sm: 8px;
    --space-md: 16px;
    --space-lg: 24px;
    
    /* Dimensions */
    --header-height: 64px;
  }

  /* Block */
  .home-page {
    /* Positioning & Layout */
    display: flex;
    flex-direction: column;
    
    /* Box Model */
    height: 100vh;
    width: 100%;
    
    /* Visual */
    background-color: var(--color-bg-body);
  }

  /* Element: Header */
  .home-page__header {
    /* Positioning */
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    /* Box Model */
    height: var(--header-height);
    padding: 0 var(--space-lg);
    border-bottom: 1px solid var(--color-border);
    
    /* Visual */
    background-color: var(--color-bg-header);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  /* Element: Header Left Container */
  .home-page__header-left {
    /* Positioning */
    display: flex;
    align-items: center;
    gap: var(--space-md); /* 使用 gap 代替 margin，更现代 */
  }

  /* Element: Logo */
  .home-page__logo {
    /* Box Model */
    width: 32px;
    height: 32px;
    
    /* Visual */
    border-radius: 50%;
    object-fit: cover;
  }

  /* Element: Title */
  .home-page__title {
    /* Box Model */
    margin: 0;
    
    /* Typography */
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--color-text-main);
  }

  /* Element: Nav Item (Router Link) */
  .home-page__nav-item {
    /* Box Model */
    padding: var(--space-sm) var(--space-md);
    margin-left: var(--space-sm);
    
    /* Typography */
    text-decoration: none;
    color: var(--color-text-light);
    font-weight: 500;
    
    /* Visual */
    border-radius: 4px;
    transition: all 0.2s;
  }

  /* State: Vue Router 自动激活类 (也可视为 Modifier) */
  .home-page__nav-item.router-link-active {
    color: var(--color-primary);
    background-color: rgba(59, 130, 246, 0.1);
  }

  /* Element: User Actions */
  .home-page__user-actions {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .home-page__welcome-text {
    font-size: 0.875rem;
    color: var(--color-text-main);
  }

  /* Element: Button */
  .home-page__btn {
    /* Box Model */
    padding: 6px 12px;
    
    /* Typography */
    font-size: 0.875rem;
    cursor: pointer;
    
    /* Visual */
    border: 1px solid transparent;
    border-radius: 4px;
  }

  /* Modifier: Secondary Button */
  .home-page__btn--secondary {
    color: var(--color-danger);
    background-color: transparent;
    border-color: var(--color-border);
  }

  .home-page__btn--secondary:hover {
    background-color: #fef2f2;
  }

  /* Element: Main Content */
  .home-page__main {
    /* Layout */
    flex: 1; /* 填满剩余高度 */
    overflow: hidden; /* 防止页面整体滚动 */
  }

  .home-page__content {
    /* Box Model */
    height: 100%;
    width: 100%;
    padding: var(--space-lg);
  }

  /* Modifier: Specific layout for private chat */
  .home-page__content--private {
    display: flex;
    gap: var(--space-lg);
  }
</style>