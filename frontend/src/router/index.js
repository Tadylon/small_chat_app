import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

// Layouts
import MainLayout from "../layouts/MainLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";

// Views
import PrivateChat from "../views/PrivateChat.vue";
import GroupList from "../views/group/GroupList.vue";
import GroupChat from "../views/group/GroupChat.vue";
import Login from "../views/auth/Login.vue";
import Register from "../views/auth/Register.vue";

const routes = [
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "PrivateChat",
        component: PrivateChat,
      },
      {
        path: "groups",
        name: "GroupList",
        component: GroupList,
      },
      {
        path: "groups/:id",
        name: "GroupChat",
        component: GroupChat,
      },
    ],
  },
  {
    path: "/auth",
    component: AuthLayout,
    children: [
      {
        path: "login",
        name: "Login",
        component: Login,
      },
      {
        path: "register",
        name: "Register",
        component: Register,
      },
      {
        path: "",
        redirect: "/auth/login",
      },
    ],
  },
  {
    path: "/login",
    redirect: "/auth/login",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// 路由守卫保持不变
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 如果还没检查过登录状态，先检查一次
  // (假设你在 store 里有个标记位，或者每次都检查)
  if (!authStore.isAuthenticated) {
    await authStore.checkAuthStatus(); // 这里现在不会报错崩溃了
  }

  // 需要登录的页面
  if (to.meta.requiresAuth) {
    if (authStore.isAuthenticated) {
      next(); // 已登录，放行
    } else {
      next("/auth/login"); // 未登录，去登录页
    }
  }
  // 已经是登录/注册页，但用户其实已登录
  else if (to.path.startsWith("/auth") && authStore.isAuthenticated) {
    next("/"); // 踢回首页
  }
  // 其他情况（比如登录页且未登录）
  else {
    next();
  }
});

export default router;
