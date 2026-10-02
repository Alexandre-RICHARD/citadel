import type { TestProject } from "vitest/node";

import { loadIntegrationTestEnvironment } from "./src/testUtils/integration/loadIntegrationTestEnvironment.ts";

// Exécuté une seule fois, avant tous les fichiers de test : la base n'est vidée qu'au lancement,
// les tests s'enchaînent ensuite sur les données laissées par les précédents
export async function setup(project: TestProject): Promise<void> {
	project.provide("testSeed", project.config.sequence.seed);

	loadIntegrationTestEnvironment();

	// Import dynamique : env.ts lit process.env dès son import, donc après le chargement de .env.test
	const { sequelize } = await import("./src/configuration/sequelize.ts");
	const { resetDatabase } =
		await import("./src/testUtils/integration/resetDatabase.ts");

	// TODO Supprimer ce reset quand la base de test sera un conteneur Docker neuf à chaque lancement
	await resetDatabase();
	await sequelize.close();
}
