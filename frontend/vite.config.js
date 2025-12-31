import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

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
      // ✅ 修复：使用标准的 ESM 方式定义别名，替代 path.resolve + __dirname
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
  },
  css: {
    // 这里不需要手动配置 postcss，Vite 会自动读取根目录的 postcss.config.js
    preprocessorOptions: {},
  },
});
