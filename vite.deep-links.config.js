import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL("./dev/deep-links/", import.meta.url)),
  envDir: projectRoot,
  // Own dependency cache, so running this next to `npm run dev` (port 3000)
  // never invalidates the main dev server's optimized deps.
  cacheDir: fileURLToPath(new URL("./node_modules/.vite-deep-links", import.meta.url)),
  publicDir: false,
  plugins: [react()],
  server: {
    host: "127.0.0.1", port: 3001, strictPort: true,
    fs: { allow: [projectRoot] },
    headers: {
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' http://localhost:8000 http://127.0.0.1:8000; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 ws://localhost:3001 ws://127.0.0.1:3001; img-src 'self' data:; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'",
    },
  },
});
