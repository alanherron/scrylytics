import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  root: "src",
  base: "./",              // ensures relative paths so Electron can load via file://
  publicDir: resolve(__dirname, "public"),
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [react()],
})
