import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["node_modules", "dist", ".git"],
    globals: true,
    hookTimeout: 5000,
    include: ["**/*.unit.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    testTimeout: 5000,
  },
});
