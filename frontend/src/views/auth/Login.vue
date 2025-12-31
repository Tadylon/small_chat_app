<template>
  <div class="hero min-h-screen bg-base-200">
    <div class="hero-content flex-col lg:flex-row-reverse w-full max-w-5xl">
      <div class="text-center lg:text-left lg:ml-10 mb-8 lg:mb-0">
        <h1 class="text-5xl font-bold text-primary">Chat App</h1>
        <p class="py-6 text-lg">
          连接你我，畅聊无限。加入我们的社区，体验现代化的即时通讯。
        </p>
      </div>

      <div class="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
        <LoginForm />
      </div>
    </div>
  </div>
</template>

<script>
import LoginForm from "@/components/auth/LoginForm.vue";

export default {
  name: "LoginPage",
  components: {
    LoginForm,
  },
};
</script>

<style scoped></style>
