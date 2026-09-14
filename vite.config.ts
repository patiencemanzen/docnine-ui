import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const BACKEND_URL = env.VITE_API_URL || "http://localhost:4000";

  type BypassFn = (req: {
    url?: string;
    headers?: Record<string, string>;
  }) => string | undefined | null;

  const makeProxy = (extraBypass?: BypassFn) => ({
    target: BACKEND_URL,
    changeOrigin: true,
    secure: false,
    bypass(req: { url?: string; headers?: Record<string, string> }) {
      if (req.url?.startsWith("/github/oauth/callback")) return undefined;
      if (req.url?.startsWith("/gitlab/oauth/callback")) return undefined;
      if (req.url?.startsWith("/bitbucket/oauth/callback")) return undefined;
      if (req.url?.startsWith("/azure/oauth/callback")) return undefined;
      if (req.url?.startsWith("/slack/oauth/callback")) return undefined;
      if (req.url?.startsWith("/auth/github/callback")) return undefined;
      if (req.url?.startsWith("/auth/google/callback")) return undefined;

      // Always serve the SPA for all other browser navigations.
      if (req.headers?.accept?.includes("text/html")) return req.url;

      return extraBypass?.(req);
    },
  });

  const proxyConfig: Record<string, object> = {
    "/auth": makeProxy(),
    "/github": makeProxy(),
    "/gitlab": makeProxy(),
    "/bitbucket": makeProxy(),
    "/azure": makeProxy(),
    "/projects": makeProxy(),
    "/billing": makeProxy(),
    "/portal": makeProxy(),
    "/webhook": makeProxy(),
    "/api": makeProxy(),
    "/health": makeProxy(),
    "/admin": makeProxy(),
    "/activity-logs": makeProxy(),
    "/notifications": makeProxy(),
    "/slack": makeProxy(),
  };

  return {
    plugins: [react(), tailwindcss()],
    define: {},
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3000,
      hmr: process.env.DISABLE_HMR !== "true",
      proxy: proxyConfig,
    },
  };
});
