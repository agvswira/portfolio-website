import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      reportsDirectory: "coverage",
      include: [
        "src/lib/content-guards.ts",
        "src/lib/content-schemas.ts",
        "src/lib/sse.ts",
        "src/lib/ui-state.ts",
        "src/server/**/*.ts",
      ],
      thresholds: {
        branches: 75,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
});
