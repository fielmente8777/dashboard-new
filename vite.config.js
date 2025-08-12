import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // Add proxy rules if you're making API requests
      "/api": {
        target: "https://nexon.eazotel.com/", // or your backend server
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
    hmr: {
      overlay: false, // Disable HMR overlay to prevent errors
    },
  },
  optimizeDeps: {
    exclude: ["@react-oauth/google"], // Add this if needed
  },
});
