import { vi } from "vitest";

import { sequelize } from "../../configuration/sequelize.ts";
import { simulatedDatabaseFailure } from "./simulatedDatabaseFailure.ts";

/**
 * Fait échouer la première requête SQL contenant `sqlFragment`, les autres passent normalement.
 * Toutes les requêtes passent par sequelize.query (y compris celles des modèles et l'écriture
 * dans error_log) : on cible donc la requête par son texte plutôt que d'échouer la suivante.
 */
export function failRawQueryOnce(sqlFragment: string): void {
	const originalQuery = sequelize.query.bind(sequelize);
	let hasFailed = false;

	vi.spyOn(sequelize, "query").mockImplementation(
		(
			sql: Parameters<typeof originalQuery>[0],
			options?: Parameters<typeof originalQuery>[1],
		) => {
			if (!hasFailed && typeof sql === "string" && sql.includes(sqlFragment)) {
				hasFailed = true;
				return Promise.reject(simulatedDatabaseFailure());
			}
			return originalQuery(sql, options);
		},
	);
}
