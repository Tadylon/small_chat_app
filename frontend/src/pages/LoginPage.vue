<template>
  <div class="login-page">
    <div class="overlay"></div>
    <div class="login-container">
      <h1>Chat App</h1>
      <LoginForm />
    </div>
  </div>
</template>

<script>
import LoginForm from "../components/LoginForm.vue";

export default {
  name: "LoginPage",
  components: {
    LoginForm,
  },
};
</script>

<style scoped></style>
