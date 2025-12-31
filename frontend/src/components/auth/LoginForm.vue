<template>
  <div class="flex items-center justify-center min-h-screen bg-base-200">
    <div class="card w-full max-w-sm shadow-2xl bg-base-100">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold justify-center mb-4">Login</h2>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">Username</span>
            </label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              placeholder="Enter your username"
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text">Password</span>
            </label>
            <input
              type="password"
              id="password"
              v-model="formData.password"
              placeholder="Enter your password"
              class="input input-bordered w-full focus:input-primary"
              required
            />
            <label class="label">
              <a href="#" class="label-text-alt link link-hover"
                >Forgot password?</a
              >
            </label>
          </div>

          <div
            v-if="authStore.error"
            class="alert alert-error shadow-lg text-sm p-2"
          >
            <span>{{ authStore.error }}</span>
          </div>

          <div class="form-control mt-6">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="authStore.loading"
            >
              <span
                v-if="authStore.loading"
                class="loading loading-spinner"
              ></span>
              {{ authStore.loading ? "Logging in..." : "Login" }}
            </button>
          </div>

          <div class="text-center text-sm mt-4">
            Don't have an account?
            <router-link to="/register" class="link link-primary font-bold"
              >Register here</router-link
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

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
