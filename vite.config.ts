import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  // Deploy target is Vercel (static SPA), not Cloudflare Workers.
  // Disable the Cloudflare plugin and render the app as a client-side SPA.
  cloudflare: false,
  tanstackStart: {
    spa: {
      enabled: true,
    },
  },
  vite: {
    server: {
      allowedHosts: ["6805-196-64-53-59.ngrok-free.app"],
    },
  },
});
