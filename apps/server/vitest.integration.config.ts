import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		// Nommé explicitement : sinon, il prendrait le nom du package, comme vitest.config.ts
		name: "@citadel/server:integration",
		include: ["src/**/*.integration.test.ts"],
		setupFiles: ["vitest.integration.setup.ts"],
		passWithNoTests: true,
		// Tous les fichiers partagent la même base : en parallèle, ils videraient les tables des autres
		fileParallelism: false,
	},
});
