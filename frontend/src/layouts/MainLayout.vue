<template>
  <div class="h-screen w-full flex flex-col bg-base-200">
    <NavBar />

    <main class="flex-1 overflow-hidden relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import NavBar from "@/components/NavBar.vue";
</script>

<style scoped>
/* 简单的页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
