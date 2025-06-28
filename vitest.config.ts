import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      exclude: [
        "node_modules/",
        "dist/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "src/constants.ts",
        "src/mnemonic.ts", // External library wrapper
      ],
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        global: {
          branches: 75,
          functions: 90,
          lines: 85,
          statements: 85,
        },
      },
    },
    environment: "node",
    exclude: ["node_modules", "dist", ".git"],
    globals: true,
    hookTimeout: 10000,
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    testTimeout: 10000,
  },
});
