import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    server: {
      allowedHosts: [
        "6805-196-64-53-59.ngrok-free.app"
      ]
    }
  }
});
