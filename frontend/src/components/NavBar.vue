<template>
  <div
    class="navbar bg-base-100 shadow-sm z-20 border-b border-base-200 min-h-[4rem]"
  >
    <div class="flex-1">
      <router-link
        to="/"
        class="btn btn-ghost normal-case text-xl text-primary gap-2"
      >
        <div class="avatar placeholder">
          <div class="bg-primary text-primary-content rounded w-8">
            <span class="text-lg">C</span>
          </div>
        </div>
        Chat App
      </router-link>

      <div class="hidden md:flex ml-6 gap-2">
        <router-link
          to="/"
          class="btn btn-sm"
          :class="$route.name === 'PrivateChat' ? 'btn-primary' : 'btn-ghost'"
        >
          私聊
        </router-link>
        <router-link
          to="/groups"
          class="btn btn-sm"
          :class="$route.path.includes('/groups') ? 'btn-primary' : 'btn-ghost'"
        >
          群聊
        </router-link>
      </div>
    </div>

    <div class="flex-none gap-2">
      <div class="dropdown dropdown-end">
        <label tabindex="0" class="btn btn-ghost btn-circle avatar placeholder">
          <div class="bg-neutral-focus text-neutral-content rounded-full w-10">
            <span>{{ authStore.user?.username?.charAt(0).toUpperCase() }}</span>
          </div>
        </label>
        <ul
          tabindex="0"
          class="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
        >
          <li><a @click="handleLogout" class="text-error">退出登录</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";
import { useChatStore } from "@/stores/chat.js";

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();

const handleLogout = async () => {
  await authStore.logout();
  chatStore.clearMessages();
  router.push("/login");
};
</script>
