import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";

import { testEnvFileUrl } from "./testEnvFileUrl.ts";

function readNonEmpty(value: string | undefined): string | undefined {
	return value === undefined || value.trim() === "" ? undefined : value;
}

// Lit seulement TEST_SEED : le reste de .env.test n'a rien à faire dans les configs Vitest
function readSeedFromTestEnvFile(): string | undefined {
	if (!existsSync(testEnvFileUrl)) return undefined;
	return parseEnv(readFileSync(testEnvFileUrl, "utf8")).TEST_SEED;
}

/**
 * Graine de l'ordre aléatoire des tests, par priorité : variable d'environnement TEST_SEED,
 * puis TEST_SEED dans le .env.test de la racine, sinon une graine neuve.
 * Écrite ensuite dans process.env : la config racine et celle d'intégration mélangent avec la même.
 */
export function resolveTestSeed(): number {
	const rawSeed =
		readNonEmpty(process.env.TEST_SEED) ??
		readNonEmpty(readSeedFromTestEnvFile()) ??
		String(Date.now());

	const seed = Number(rawSeed);
	if (!Number.isSafeInteger(seed))
		throw new Error(`TEST_SEED doit être un entier (reçu : "${rawSeed}")`);

	process.env.TEST_SEED = String(seed);
	return seed;
}
