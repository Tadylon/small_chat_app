import { defineStore } from 'pinia';
import api from '../services/api.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  }),

  getters: {
    currentUser: (state) => state.user,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.register(userData);
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Registration failed';
        this.loading = false;
        throw error;
      }
    },

    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.login(credentials);
        this.user = response.data;
        this.isAuthenticated = true;
        // Save auth state to localStorage
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('isAuthenticated', 'true');
        this.loading = false;
        return response;
      } catch (error) {
        this.error = error.message || 'Login failed';
        this.loading = false;
        throw error;
      }
    },

    async logout() {
      try {
        await api.logout();
        this.user = null;
        this.isAuthenticated = false;
        this.error = null;
        // Clear auth state from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      } catch (error) {
        this.error = error.message || 'Logout failed';
        throw error;
      }
    },

    // Initialize auth state from localStorage
    initAuthState() {
      const storedUser = localStorage.getItem('user');
      const storedAuth = localStorage.getItem('isAuthenticated');

      if (storedUser && storedAuth === 'true') {
        this.user = JSON.parse(storedUser);
        this.isAuthenticated = true;
      }
    },

    async fetchCurrentUser() {
      if (!this.isAuthenticated) return;

      try {
        const response = await api.getCurrentUser();
        this.user = response.data;
        // Update localStorage with current user data
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch (error) {
        // If fetching current user fails, logout
        this.logout();
        throw error;
      }
    }
  }
});