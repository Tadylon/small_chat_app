<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col w-full">
      <div class="text-center mb-4">
        <h1 class="text-4xl font-bold text-primary">Chat App</h1>
        <p class="py-2">创建新账户</p>
      </div>

      <div class="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
        <RegisterForm />
      </div>
    </div>
  </div>
</template>

<script>
import RegisterForm from "@/components/auth/RegisterForm.vue";

export default {
  name: "RegisterPage",
  components: {
    RegisterForm,
  },
};
</script>

<style scoped></style>
