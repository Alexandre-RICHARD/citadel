import { defineConfig } from "vitest/config";

// Node par défaut, comme le serveur : les tests de src/browser et src/react demandent jsdom
// en tête de fichier (// @vitest-environment jsdom)
export default defineConfig({
	test: {
		environment: "node",
		include: ["src/**/*.unit.test.ts?(x)"],
		setupFiles: ["vitest.setup.ts"],
		passWithNoTests: true,
	},
});
