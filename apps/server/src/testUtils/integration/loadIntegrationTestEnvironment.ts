import path from "node:path";

import { config } from "dotenv";

const TEST_DATABASE_SUFFIX = "_test";

export function loadIntegrationTestEnvironment(): void {
	const dotenvResult = config({
		path: path.resolve(import.meta.dirname, "../../../.env.test"),
		override: true,
		quiet: true,
	});
	if (dotenvResult.error)
		throw new Error("Fichier .env.test introuvable (voir .env.example)", {
			cause: dotenvResult.error,
		});

	// on refuse de tourner sur autre chose qu'une base de test
	const databaseName = process.env.DB_DATABASE_NAME ?? "";
	if (!databaseName.endsWith(TEST_DATABASE_SUFFIX))
		throw new Error(
			`DB_DATABASE_NAME doit finir par "${TEST_DATABASE_SUFFIX}" (reçu : "${databaseName}")`,
		);
}
