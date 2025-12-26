<template>
  <div class="login-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="formData.username" required />
      </div>

      <div class="form-group">
        <label for="password">Password:</label>
        <input
          type="password"
          id="password"
          v-model="formData.password"
          required
        />
      </div>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? "Logging in..." : "Login" }}
      </button>

      <div v-if="authStore.error" class="error">
        {{ authStore.error }}
      </div>

      <div class="form-footer">
        <p>
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

export default {
  name: "LoginForm",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const formData = reactive({
      username: "",
      password: "",
    });

    const handleLogin = async () => {
      try {
        await authStore.login({
          username: formData.username,
          password: formData.password,
        });

        // Redirect to home page after successful login
        router.push("/");
      } catch (error) {
        // Error is handled in the store
        console.error("Login failed:", error);
      }
    };

    return {
      formData,
      authStore,
      handleLogin,
    };
  },
};
</script>

<style scoped></style>
