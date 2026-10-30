import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // relative asset paths, so the build works at any address: GitHub Pages
  // (verasjulia.github.io/cartografia-gamboa/) or the institution's domain
  base: "./",
  build: {
    outDir: "build"
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./test/setup.js",
    passWithNoTests: true
  },
});
