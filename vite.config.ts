import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Proxy removed - API requests will be handled by the unified server
  },
  optimizeDeps: {
    // Include specific dependencies that are causing issues
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'next-themes',
      '@tanstack/react-query'
    ],
    // Force optimization even if dependencies haven't changed
    force: true
  },
  plugins: [
    react({
      // Use the correct options for @vitejs/plugin-react-swc
      jsxImportSource: 'react'
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
