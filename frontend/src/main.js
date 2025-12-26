import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { useAuthStore } from "./stores/auth.js";
import "@/assets/styles/index.scss";
// Create Vue app
const app = createApp(App);

// Use Pinia for state management
const pinia = createPinia();
app.use(pinia);

// Initialize auth state from localStorage
const authStore = useAuthStore();
authStore.initAuthState();

// Use Vue Router
app.use(router);

// Mount app
app.mount("#app");
