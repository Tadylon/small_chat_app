<template>
  <div class="flex items-center justify-center min-h-screen bg-base-200">
    <div class="card w-full max-w-md shadow-2xl bg-base-100">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold justify-center mb-4">
          Create Account
        </h2>

        <form @submit.prevent="handleRegister" class="space-y-2">
          <div class="form-control">
            <label class="label" for="username">
              <span class="label-text">Username</span>
            </label>
            <input
              type="text"
              id="username"
              v-model="formData.username"
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text">Email</span>
            </label>
            <input
              type="email"
              id="email"
              v-model="formData.email"
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
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div class="form-control">
            <label class="label" for="confirmPassword">
              <span class="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              v-model="formData.confirmPassword"
              class="input input-bordered w-full focus:input-primary"
              required
            />
          </div>

          <div
            v-if="authStore.error"
            class="alert alert-error shadow-lg mt-4 text-sm p-2"
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
              {{ authStore.loading ? "Registering..." : "Register" }}
            </button>
          </div>

          <div class="text-center text-sm mt-4">
            Already have an account?
            <router-link to="/login" class="link link-primary font-bold"
              >Login here</router-link
            >
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

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
