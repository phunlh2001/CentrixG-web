import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "@centrixg/shared": fileURLToPath(
        new URL("./src/shared/index.ts", import.meta.url),
      ),
    },
  },
  server: {
    open: true,
  },
});
