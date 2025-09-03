import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.ts?(x)"],
    exclude: [],
    outputFile: "./report/index.html",
    setupFiles: "vitest.setup.ts",
    passWithNoTests: true,
    coverage: {
      reportOnFailure: true,
      reportsDirectory: "./report/coverage",
      enabled: false,
      provider: "v8",
      reporter: "html",
      include: ["src/**/*.{ts,tsx,js,jsx}"],
      exclude: [
        "src/**/*.type.ts",
        "src/**/*.d.ts",
        "src/**/*.enum.ts",
        "src/**/*.test.*",
      ],
    },
  },
});
