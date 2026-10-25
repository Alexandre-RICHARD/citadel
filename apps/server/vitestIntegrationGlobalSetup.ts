import type { TestProject } from "vitest/node";

import { loadIntegrationTestEnvironment } from "./src/testUtils/integration/loadIntegrationTestEnvironment.ts";
import { startTestDatabase } from "./src/testUtils/integration/startTestDatabase.ts";

// Exécuté une seule fois, avant tous les fichiers de test : la base est neuve au lancement,
// les tests s'enchaînent ensuite sur les données laissées par les précédents
export function setup(project: TestProject): void {
	project.provide("testSeed", project.config.sequence.seed);

	loadIntegrationTestEnvironment();
	startTestDatabase();
}
