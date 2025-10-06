import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.js';

// Page components
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import HomePage from '../pages/HomePage.vue';
import GroupListPage from '../pages/GroupListPage.vue';
import GroupChatPage from '../pages/GroupChatPage.vue';

// Define routes
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: { requiresAuth: true },
    children: [
      {
        path: '/group',
        name: 'Groups',
        component: GroupListPage
      },
      {
        path: '/group/:id',
        name: 'GroupChat',
        component: GroupChatPage
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage
  }
];

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Try to authenticate the user
    try {
      const isAuthenticated = await authStore.checkAuthStatus();
      if (isAuthenticated) {
        next();
      } else {
        next('/login');
      }
    } catch (error) {
      next('/login');
    }
  } else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router;