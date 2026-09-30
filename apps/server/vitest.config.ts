import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		outputFile: "./report/index.html",
		passWithNoTests: true,
		coverage: {
			reportOnFailure: true,
			reportsDirectory: "./report/coverage",
			enabled: false,
			provider: "v8",
			reporter: "html",
			include: ["src/**/*.{ts,js}"],
			exclude: [
				"src/**/*.type.ts",
				"src/**/*.d.ts",
				"src/**/*.enum.ts",
				"src/**/*.test.*",
				"src/testUtils/**",
				"src/todo_folder/**", // TODO
			],
		},
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					include: ["src/**/*.unit.test.ts"],
					setupFiles: ["vitest.setup.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "integration",
					include: ["src/**/*.integration.test.ts"],
					setupFiles: ["vitest.integration.setup.ts"],
					// Tous les fichiers partagent la même base : en parallèle, ils videraient les tables des autres
					fileParallelism: false,
				},
			},
		],
	},
});
