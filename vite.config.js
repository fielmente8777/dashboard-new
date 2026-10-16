import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // the same variable (and default) as src/config/env.js
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const coreApiUrl = env.VITE_CORE_API_URL || "https://nexon.eazotel.com";

  return {
    plugins: [react(), tailwindcss()],
    base: "/",
    server: {
      port: 3000,
      proxy: {
        // Add proxy rules if you're making API requests
        "/api": {
          target: coreApiUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
      allowedHosts: true,
      hmr: {
        overlay: false, // Disable HMR overlay to prevent errors
      },
    },
    optimizeDeps: {
      exclude: ["@react-oauth/google"], // Add this if needed
    },
  };
});
