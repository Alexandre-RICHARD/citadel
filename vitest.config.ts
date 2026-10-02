import { defineConfig } from "vitest/config";

import { resolveTestSeed } from "./apps/server/src/testUtils/integration/resolveTestSeed.ts";

export default defineConfig({
	test: {
		// Seuls les fichiers sont mélangés ici : le projet d'intégration mélange en plus ses tests.
		// Graine résolue avant le chargement des projets : la config d'intégration relit la même
		sequence: {
			shuffle: { files: true, tests: false },
			seed: resolveTestSeed(),
		},
		// Vitest ignore les "projects" d'une config listée ici : on pointe donc les projets de common, pas son vitest.config.ts
		projects: [
			"apps/client/vitest.config.ts",
			"apps/server/vitest.config.ts",
			"apps/server/vitest.integration.config.ts",
			"packages/common/vitest.universal.config.ts",
			"packages/common/vitest.browser.config.ts",
			"packages/specs/vitest.config.ts",
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
				"**/testUtils/**",
				"**/todo_folder/**", // TODO
			],
		},
	},
});
