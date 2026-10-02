import "./src/configuration/timezone.ts";

import { afterAll, beforeEach, inject } from "vitest";

import { loadIntegrationTestEnvironment } from "./src/testUtils/integration/loadIntegrationTestEnvironment.ts";

loadIntegrationTestEnvironment();

// Import dynamique : env.ts lit process.env dès son import, donc après le chargement de .env.test
const { sequelize } = await import("./src/configuration/sequelize.ts");

const testSeed = inject("testSeed");

// Annotée au début de chaque test, car Vitest refuse d'annoter un test déjà en échec.
// Le terminal ne l'affiche que sous un échec, le rapport HTML sur chaque test
beforeEach(async ({ annotate }) => {
	await annotate(
		`Ordre aléatoire de graine ${testSeed} : pour rejouer exactement le même ordre, ajouter TEST_SEED=${testSeed} dans apps/server/.env.test (puis retirer la ligne pour revenir au hasard)`,
	);
});

afterAll(async () => {
	await sequelize.close();
});
