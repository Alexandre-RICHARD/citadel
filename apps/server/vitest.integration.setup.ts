import "./src/timezone.ts";

import { config } from "dotenv";
import { afterAll } from "vitest";

const TEST_DATABASE_SUFFIX = "_test";

const dotenvResult = config({ path: ".env.test", override: true, quiet: true });
if (dotenvResult.error)
	throw new Error("Fichier .env.test introuvable (voir .env.exemple)", {
		cause: dotenvResult.error,
	});

// Les tests vident les tables : on refuse de tourner sur autre chose qu'une base de test
const databaseName = process.env.DB_DATABASE_NAME ?? "";
if (!databaseName.endsWith(TEST_DATABASE_SUFFIX))
	throw new Error(
		`DB_DATABASE_NAME doit finir par "${TEST_DATABASE_SUFFIX}" (reçu : "${databaseName}")`,
	);

// Import dynamique : env.ts lit process.env dès son import, donc après le chargement de .env.test
const { sequelize } = await import("./src/sequelize.ts");

afterAll(async () => {
	await sequelize.close();
});
