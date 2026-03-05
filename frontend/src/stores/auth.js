import { defineStore } from "pinia";
import api from "@/services/api.js";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated,
  },

  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.register(userData);
        this.loading = false;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || "Registration failed";
        this.loading = false;
        throw error;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.login(credentials);

        // 更新状态
        this.user = response.data.user || response.data;
        this.isAuthenticated = true;

        // 🔥 保存到 LocalStorage (这就是 initAuthState 需要读取的数据)
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("isAuthenticated", "true");

        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.response?.data?.message || "Login failed";
        this.loading = false;
        throw error;
      }
    },

    async logout() {
      try {
        await api.logout();
      } catch (error) {
        console.error("Logout error", error);
      } finally {
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;
        // 🔥 清除 LocalStorage
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
      }
    },

    // ✅✅✅ 补回了这个丢失的方法 ✅✅✅
    initAuthState() {
      const storedUser = localStorage.getItem("user");
      const storedAuth = localStorage.getItem("isAuthenticated");

      if (storedUser && storedAuth === "true") {
        try {
          this.user = JSON.parse(storedUser);
          this.isAuthenticated = true;
        } catch (e) {
          // 如果 JSON 解析失败，清除垃圾数据
          localStorage.removeItem("user");
          localStorage.removeItem("isAuthenticated");
        }
      }
    },

    // 检查服务端 Session 状态
    async checkAuthStatus() {
      try {
        const response = await api.get("/auth/me");
        this.user = response.data;
        this.isAuthenticated = true;
        // 同步更新 LocalStorage
        localStorage.setItem("user", JSON.stringify(this.user));
        localStorage.setItem("isAuthenticated", "true");
        return true;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          console.log("用户未登录 (401) - 正常行为");
        } else {
          console.error("Auth check error:", error);
        }

        // 验证失败，清理状态
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem("user");
        localStorage.removeItem("isAuthenticated");
        return false;
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await api.getCurrentUser();
        this.user = response.data;
        this.isAuthenticated = true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },
  },
});
