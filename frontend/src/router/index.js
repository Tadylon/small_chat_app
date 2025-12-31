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

  if (!authStore.isAuthenticated && to.meta.requiresAuth) {
    const success = await authStore.checkAuthStatus();
    if (!success) return next("/auth/login");
  }

  if (authStore.isAuthenticated && to.path.startsWith("/auth")) {
    return next("/");
  }

  next();
});

export default router;
