<template>
  <div class="flex h-full bg-base-100">
    <div class="w-80 border-r border-base-200 flex flex-col hidden md:flex">
      <div class="p-4 border-b border-base-200 font-bold opacity-70">
        在线好友
      </div>
      <UserList class="flex-1" />
    </div>

    <div class="flex-1 h-full relative">
      <ChatWindow />
    </div>
  </div>
</template>

<script setup>
import UserList from "../components/chat/UserList.vue";
import ChatWindow from "../components/chat/ChatWindow.vue";
</script>
