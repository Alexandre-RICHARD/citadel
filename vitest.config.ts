import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Vitest ignore les "projects" d'une config listée ici : on pointe donc les projets de common, pas son vitest.config.ts
		projects: [
			"apps/client/vitest.config.ts",
			"apps/server/vitest.config.ts",
			"apps/server/vitest.integration.config.ts",
			"packages/common/vitest.universal.config.ts",
			"packages/common/vitest.browser.config.ts",
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
				"**/*.interface.ts",
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
