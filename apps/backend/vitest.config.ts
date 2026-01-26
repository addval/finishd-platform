import path from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

const __dirname = path.dirname(fileURLToPath(new URL(".", import.meta.url)))

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "tests/",
        "**/*.config.ts",
        "**/*.test.ts",
        "**/*.spec.ts",
        "src/server.ts",
        "migrations/",
        "seeders/",
      ],
    },
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", "dist"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@config": path.resolve(__dirname, "./src/config"),
      "@controllers": path.resolve(__dirname, "./src/controllers"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@models": path.resolve(__dirname, "./src/models"),
      "@routes": path.resolve(__dirname, "./src/routes"),
      "@middlewares": path.resolve(__dirname, "./src/middlewares"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@shared/types": path.resolve(__dirname, "../../packages/shared-types/src"),
      "@shared/utils": path.resolve(__dirname, "../../packages/shared-utils/src"),
    },
  },
})
