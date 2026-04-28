import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [
        "585c-196-65-48-245.ngrok-free.app"
      ]
    }
  }
});
