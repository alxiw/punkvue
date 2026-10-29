import { defineConfig, loadEnv } from "vite"
import vue from "@vitejs/plugin-vue"
import VueDevTools from "vite-plugin-vue-devtools"
import {fileURLToPath} from "node:url";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Includes prefixed variables from .env* files and from the process environment,
  // so `docker build --build-arg` / CI job env are picked up as well.
  const env = loadEnv(mode, process.cwd(), "VITE_")

  // VITE_* values are inlined into the bundle at build time. Without the API URL the
  // app would silently fall back to its own origin, so stop the build instead of
  // shipping a bundle that cannot reach the API.
  if (command === "build" && !env.VITE_API_BASE_URL) {
    throw new Error(
      "VITE_API_BASE_URL is not set: copy .env.example to .env, or pass it as an " +
        "environment variable (docker build --build-arg VITE_API_BASE_URL=https://punkapi.dev/v3)",
    )
  }

  return {
    plugins: [
      VueDevTools(),
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
  }
})
