import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The React member portal is served under /app (the Cowork marketing site
// lives at the root). base + outDir keep asset URLs and files aligned.
export default defineConfig({
  plugins: [react()],
  base: "/app/",
  build: {
    outDir: "dist/app",
    emptyOutDir: true,
  },
  server: { port: 5173 },
});
