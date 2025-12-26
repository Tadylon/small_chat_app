<template>
  <div class="sidebar">
    <div class="sidebar-item">
      <i class="icon-chat"></i>
      <span>Chat</span>
    </div>
    <div class="sidebar-item">
      <i class="icon-space"></i>
      <span>Space</span>
    </div>
    <div class="sidebar-item">
      <i class="icon-learn"></i>
      <span>Learn</span>
    </div>
    <div class="sidebar-item">
      <i class="icon-settings"></i>
      <span>Settings</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar'
};
</script>

<style scoped>
.sidebar {
  width: 60px; /* Adjust as needed */
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
}

.sidebar-item {
  margin-bottom: 20px;
  cursor: pointer;
  font-size: 0.8em;
  text-align: center;
}

.sidebar-item:hover {
  color: #42b983;
}

.sidebar-item i {
  font-size: 24px;
  margin-bottom: 5px;
  display: block;
}

/* Placeholder styles for icons */
.icon-chat::before {
  content: '💬'; /* Example emoji as icon */
}

.icon-space::before {
  content: '🚀'; /* Example emoji as icon */
}

.icon-learn::before {
  content: '📚'; /* Example emoji as icon */
}

.icon-settings::before {
  content: '⚙️'; /* Example emoji as icon */
}
</style>