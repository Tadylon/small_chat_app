<template>
  <router-view />
</template>

<script setup>
// App.vue 不需要引入 Sidebar 或 NavBar
// 这些组件现在由 router/index.js 中的 Layout 负责加载
</script>

<style>
/* 全局样式可以放在这里，或者放在 assets/main.css */
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
