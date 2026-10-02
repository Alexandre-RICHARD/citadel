import "./src/configuration/timezone.ts";

import { config } from "dotenv";
import { afterAll, beforeEach } from "vitest";

const TEST_DATABASE_SUFFIX = "_test";

const dotenvResult = config({
	path: `${import.meta.dirname}/.env.test`,
	override: true,
	quiet: true,
});
if (dotenvResult.error)
	throw new Error("Fichier .env.test introuvable (voir .env.example)", {
		cause: dotenvResult.error,
	});

// Les tests vident les tables : on refuse de tourner sur autre chose qu'une base de test
const databaseName = process.env.DB_DATABASE_NAME ?? "";
if (!databaseName.endsWith(TEST_DATABASE_SUFFIX))
	throw new Error(
		`DB_DATABASE_NAME doit finir par "${TEST_DATABASE_SUFFIX}" (reçu : "${databaseName}")`,
	);

// Import dynamique : env.ts lit process.env dès son import, donc après le chargement de .env.test
const { sequelize } = await import("./src/configuration/sequelize.ts");
const { resetDatabase } =
	await import("./src/testUtils/integration/resetDatabase.ts");

beforeEach(async () => {
	await resetDatabase();
});

afterAll(async () => {
	await sequelize.close();
});
