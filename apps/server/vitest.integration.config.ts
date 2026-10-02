import { defineConfig } from "vitest/config";

import { resolveTestSeed } from "./src/testUtils/integration/resolveTestSeed.ts";

export default defineConfig({
	test: {
		// Nommé explicitement : sinon, il prendrait le nom du package, comme vitest.config.ts
		name: "@citadel/server:integration",
		include: ["src/**/*.integration.test.ts"],
		globalSetup: ["vitestIntegrationGlobalSetup.ts"],
		setupFiles: ["vitestIntegrationSetup.ts"],
		passWithNoTests: true,
		restoreMocks: true,
		// Fichiers et tests dans un ordre aléatoire, sans nettoyage entre eux : chaque test doit tolérer les données des autres.
		// TEST_SEED dans .env.test fixe la graine pour rejouer un lancement à l'identique
		sequence: { shuffle: true, seed: resolveTestSeed() },
		// Séquentiel : une même graine rejoue alors exactement le même enchaînement
		fileParallelism: false,
	},
});
