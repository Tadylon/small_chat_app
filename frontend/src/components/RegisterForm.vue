<template>
  <div class="register-form">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="username">Username:</label>
        <input type="text" id="username" v-model="formData.username" required />
      </div>

      <div class="form-group">
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="formData.email" required />
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

      <div class="form-group">
        <label for="confirmPassword">Confirm Password:</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="formData.confirmPassword"
          required
        />
      </div>

      <button type="submit" :disabled="authStore.loading">
        {{ authStore.loading ? "Registering..." : "Register" }}
      </button>

      <div v-if="authStore.error" class="error">
        {{ authStore.error }}
      </div>

      <div class="form-footer">
        <p>
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth.js";

export default {
  name: "RegisterForm",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const formData = reactive({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    const handleRegister = async () => {
      // Check if passwords match
      if (formData.password !== formData.confirmPassword) {
        authStore.error = "Passwords do not match";
        return;
      }

      try {
        await authStore.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        // Redirect to login page after successful registration
        router.push("/login");
      } catch (error) {
        // Error is handled in the store
        console.error("Registration failed:", error);
      }
    };

    return {
      formData,
      authStore,
      handleRegister,
    };
  },
};
</script>

<style scoped></style>
