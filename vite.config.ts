import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    open: false,
    // Proxies same-origin /api requests to Railway so the browser never issues
    // a cross-origin request in dev, avoiding preflight/CORS entirely.
    proxy: {
      "/api": {
        target: "https://i-erp-backend-production.up.railway.app",
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
