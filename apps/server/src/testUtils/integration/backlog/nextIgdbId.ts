import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type MaxIdRow = {
	maxId: number | null;
};

// Prochain id libre, partagé par tous les ids IGDB d'un fichier de test ; null : pas encore lu en base
let nextId: number | null = null;

/**
 * Un id IGDB jamais utilisé : les tests ne vident pas la base entre eux, et les tables globales prennent l'id d'IGDB
 * comme clé. Le premier appel d'un fichier part du plus grand id déjà en base (les fichiers s'exécutent un par un)
 */
export async function nextIgdbId(): Promise<number> {
	if (nextId === null) {
		const row = await sequelize.query<MaxIdRow>(
			`SELECT GREATEST(
				(SELECT COALESCE(MAX(id), 0) FROM backlog_game),
				(SELECT COALESCE(MAX(id), 0) FROM backlog_version),
				(SELECT COALESCE(MAX(id), 0) FROM backlog_dlc),
				(SELECT COALESCE(MAX(id), 0) FROM backlog_platform),
				(SELECT COALESCE(MAX(id), 0) FROM backlog_company),
				1000
			) AS maxId`,
			{ type: QueryTypes.SELECT, plain: true },
		);
		nextId = Number(row?.maxId ?? 1000) + 1;
	}
	const id = nextId;
	nextId += 1;
	return id;
}
