import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/  |  https://vitest.dev/config/
export default defineConfig(({ command }) => ({
  // Trang quản trị được deploy làm sub-application "/admin" trên cùng domain với trang công khai
  // (xem deploy/HUONG_DAN_CHAY_THU_SQLSERVER_IIS_PM2.md) — asset (JS/CSS) phải trỏ đúng "/admin/..."
  // thay vì "/...". CHỈ áp dụng khi build ("pnpm build"), giữ nguyên "/" lúc "pnpm dev" để chạy local
  // ở http://localhost:5174/ như bình thường (không phải http://localhost:5174/admin/).
  base: command === "build" ? "/admin/" : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src")
    }
  },
  server: {
    port: 5174
  },
  preview: {
    port: 5174
  },
  test: {
    environment: "jsdom",
    globals: true,
    css: true,
    include: ["src/**/*.test.{ts,tsx}"]
  }
}));
