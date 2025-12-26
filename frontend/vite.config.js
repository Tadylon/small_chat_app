import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
  css: {
    preprocessorOptions: {
      scss: {
        // additionalData 的作用是：
        // 在每个 .vue 文件的 <style lang="scss"> 顶部，自动加上这一行代码
        additionalData: `@import "@/assets/styles/mixins.scss";`,
      },
    },
  },
});
