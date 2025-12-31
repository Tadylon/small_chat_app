<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center p-4">
    <div class="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
      <div class="text-center lg:text-left hidden lg:block">
        <h1 class="text-5xl font-bold text-primary mb-4">Chat App</h1>
        <p class="text-lg text-base-content/70 leading-relaxed">
          连接你我，畅聊无限。<br />加入我们的社区，体验现代化的即时通讯。
        </p>
      </div>

      <div class="card w-full max-w-md shadow-2xl bg-base-100 mx-auto">
        <div class="card-body">
          <router-view />
        </div>
      </div>
    </div>
  </div>
</template>
