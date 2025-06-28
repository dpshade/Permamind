import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["node_modules", "dist", ".git"],
    globals: true,
    hookTimeout: 10000,
    include: ["**/*.integration.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    setupFiles: ["./tests/setup/integration.ts"],
    testTimeout: 30000,
  },
});
