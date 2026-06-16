import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "^/campaign(/.*)?$": { target: "http://localhost:8000", changeOrigin: true },
      "^/agents(/.*)?$":   { target: "http://localhost:8000", changeOrigin: true },
      "^/report(/.*)?$":   { target: "http://localhost:8000", changeOrigin: true },
      "^/health$":         { target: "http://localhost:8000", changeOrigin: true },
      "^/ws(/.*)?$": {
        target: "ws://localhost:8000",
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
