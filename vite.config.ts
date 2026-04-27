import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [
        "8d1d-197-147-167-35.ngrok-free.app"
      ]
    }
  }
});
