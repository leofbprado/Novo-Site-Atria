import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  envDir: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // Separa libs grandes em chunks próprios pra:
        //   1. Reduzir o index.js inicial (carrega menos bytes pra render do hero)
        //   2. Cachear independente do código do app (vendor raramente muda)
        manualChunks: {
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          "framer-motion": ["framer-motion"],
          "react-query": ["@tanstack/react-query"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString()),
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
