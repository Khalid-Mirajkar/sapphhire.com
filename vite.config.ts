
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./", // Ensures assets are loaded correctly when deployed
  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: true,
  },
  esbuild: {
    // Strip console.log/debug calls in production builds (keep warn/error)
    drop: mode === 'production' ? ['debugger'] : [],
    pure: mode === 'production' ? ['console.log', 'console.debug', 'console.info'] : [],
  }
}));
