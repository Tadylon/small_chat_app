<template>
  <div id="app">
    <Sidebar />
    <div class="main-content">
      <router-view />
    </div>
  </div>
</template>

<script>
import Sidebar from "./components/Sidebar.vue";

export default {
  name: "App",
  components: {
    Sidebar,
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
    Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4edf5 100%);
  color: #333;
  line-height: 1.6;
}

#app {
  height: 100vh;
  overflow: hidden;
}

.main-content {
  margin-left: 60px; /* Adjust this value to match your sidebar width */
  flex: 1;
  width: 100%;
  height: 100vh;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
    padding: 15px;
  }

  .header-left {
    flex-direction: column;
    align-items: center;
    gap: 15px;
  }

  .nav-links {
    width: 100%;
    justify-content: center;
  }

  .user-info {
    width: 100%;
    justify-content: center;
  }

  .chat-container {
    flex-direction: column;
  }

  .group-actions {
    flex-direction: column;
    gap: 10px;
  }

  .chat-input form {
    flex-direction: column;
  }

  .message-input {
    margin-bottom: 10px;
  }

  .modal-content {
    width: 95%;
    padding: 15px;
  }

  .application-actions {
    flex-direction: column;
    gap: 5px;
  }

  .groups-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: column;
    gap: 15px;
  }

  .btn {
    padding: 10px 15px;
    font-size: 14px;
  }

  .message {
    max-width: 85% !important;
  }

  .member-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .application-actions {
    width: 100%;
    justify-content: space-between;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(120deg, #007bff, #00bcd4);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(120deg, #0056b3, #00838f);
}
</style>
