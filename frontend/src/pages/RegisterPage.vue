<template>
  <div class="register-page">
    <div class="overlay"></div>
    <div class="register-container">
      <h1>Chat App</h1>
      <RegisterForm />
    </div>
  </div>
</template>

<script>
import RegisterForm from "../components/RegisterForm.vue";

export default {
  name: "RegisterPage",
  components: {
    RegisterForm,
  },
};
</script>

<style scoped></style>
