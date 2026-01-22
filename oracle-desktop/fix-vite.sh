#!/bin/bash
echo "🔮 Fixing Vite base path and rebuilding for Electron"

cat > vite.config.js <<'EOF'
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  root: "src",
  base: "./",              // ensures relative paths so Electron can load via file://
  build: {
    outDir: "../dist",
    emptyOutDir: true,
  },
  plugins: [react()],
})
EOF

sed -i.bak 's/src="\/main.jsx"/src=".\/main.jsx"/' src/index.html

rm -rf dist
npm run build && npm start

