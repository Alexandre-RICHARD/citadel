import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: [
			"apps/*/vitest.config.ts",
			"apps/*/vitest.integration.config.ts",
			"packages/*/vitest.config.ts",
		],
		outputFile: "./report/index.html",
		passWithNoTests: true,
		coverage: {
			reportOnFailure: true,
			reportsDirectory: "./report/coverage",
			enabled: false,
			provider: "v8",
			reporter: "html",
			include: ["apps/*/src/**/*.{ts,tsx}", "packages/*/src/**/*.{ts,tsx}"],
			exclude: [
				"**/*.type.ts",
				"**/*.d.ts",
				"**/*.enum.ts",
				"**/*.test.*",
				"**/*.stories.tsx",
				"**/todo_folder/**", // TODO
				"apps/server/src/testUtils/**",
			],
		},
	},
});
