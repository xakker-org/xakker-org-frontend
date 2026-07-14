import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  envDir: path.resolve(__dirname, ".."),
  server: {
    allowedHosts: ["self-study.xakker.org", "localhost", "127.0.0.1"],
  },
  build: {
    outDir: "./dist",
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: "app.[hash].js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith(".css")) {
            return "app.[hash].css";
          }
          return "assets/[name].[hash][extname]";
        },
      },
    },
  },
});
