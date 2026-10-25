import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

import { testEnvFileUrl } from "./testEnvFileUrl.ts";

const TEST_DATABASE_SUFFIX = "_test";

export function loadIntegrationTestEnvironment(): void {
	if (!existsSync(testEnvFileUrl))
		throw new Error(
			"Fichier .env.test introuvable à la racine du dépôt (voir .env.example)",
		);

	// Les valeurs de .env.test remplacent celles déjà présentes dans process.env
	Object.assign(process.env, parseEnv(readFileSync(testEnvFileUrl, "utf8")));

	// on refuse de tourner sur autre chose qu'une base de test
	const databaseName = process.env.DB_DATABASE_NAME ?? "";
	if (!databaseName.endsWith(TEST_DATABASE_SUFFIX))
		throw new Error(
			`DB_DATABASE_NAME doit finir par "${TEST_DATABASE_SUFFIX}" (reçu : "${databaseName}")`,
		);
}
