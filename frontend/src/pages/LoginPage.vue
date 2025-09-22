<template>
  <div class="login-page">
    <div class="overlay"></div>
    <div class="login-container">
      <div class="logo-container">
        <img src="../assets/picture.jpg" alt="Chat App Logo" class="logo" />
      </div>
      <h1>Chat App</h1>
      <LoginForm />
    </div>
  </div>
</template>

<script>
import LoginForm from '../components/LoginForm.vue';

export default {
  name: 'LoginPage',
  components: {
    LoginForm
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-image: url('../assets/picture.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  position: relative;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
}

.login-container {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1;
  position: relative;
}

.logo-container {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
}

.login-container h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 2.5rem;
  font-weight: bold;
}
</style>