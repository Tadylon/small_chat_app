<template>
  <div class="login-form">
    <h2>Login</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">Username:</label>
        <input
          type="text"
          id="username"
          v-model="formData.username"
          required
        />
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
        {{ authStore.loading ? 'Logging in...' : 'Login' }}
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
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

export default {
  name: 'LoginForm',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const formData = reactive({
      username: '',
      password: ''
    });

    const handleLogin = async () => {
      try {
        await authStore.login({
          username: formData.username,
          password: formData.password
        });

        // Redirect to home page after successful login
        router.push('/');
      } catch (error) {
        // Error is handled in the store
        console.error('Login failed:', error);
      }
    };

    return {
      formData,
      authStore,
      handleLogin
    };
  }
};
</script>

<style scoped>
.login-form {
  max-width: 450px;
  margin: 0 auto;
  padding: 40px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.form-group {
  margin-bottom: 25px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 15px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  box-sizing: border-box;
  font-size: 16px;
  transition: all 0.3s ease;
}

input:focus {
  border-color: #007bff;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.2);
}

button {
  width: 100%;
  padding: 15px;
  background: linear-gradient(120deg, #007bff, #00bcd4);
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

button:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
}

.error {
  color: #dc3545;
  margin-top: 15px;
  text-align: center;
  padding: 12px;
  background: #f8d7da;
  border-radius: 8px;
  border: 1px solid #f5c6cb;
}

.form-footer {
  margin-top: 25px;
  text-align: center;
}

.form-footer a {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 600;
}
</style>