import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { externalizeDepsPlugin, defineConfig } from "electron-vite";
import { fileURLToPath, URL } from "node:url";

const resolvePath = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolvePath("./electron/main.ts"),
        },
        output: {
          entryFileNames: "[name].cjs",
          format: "cjs",
        },
      },
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolvePath("./electron/preload.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          format: "cjs",
        },
      },
    },
  },
  renderer: {
    root: ".",
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": resolvePath("./src"),
        "@centrixg/shared": resolvePath("./src/shared/index.ts"),
      },
    },
    build: {
      rollupOptions: {
        input: resolvePath("./index.html"),
      },
    },
  },
});
