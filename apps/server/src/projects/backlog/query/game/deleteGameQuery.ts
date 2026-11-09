import type { Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

/**
 * Le jeu quitte la base avec ses plateformes de version, ses versions et ses DLC (leurs clés étrangères n'ont pas de
 * cascade : ils partent dans l'ordre, du plus dépendant au jeu). Les séries, sociétés et plateformes restent : elles
 * servent aussi à d'autres jeux
 */
export async function deleteGameQuery(
	gameId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await sequelize.query(
			`DELETE vp FROM backlog_version_platform vp
				JOIN backlog_version v ON v.id = vp.version_id
				WHERE v.game_id = :gameId`,
			{ replacements: { gameId }, transaction },
		);
		await sequelize.query("DELETE FROM backlog_dlc WHERE game_id = :gameId", {
			replacements: { gameId },
			transaction,
		});
		await sequelize.query(
			"DELETE FROM backlog_version WHERE game_id = :gameId",
			{ replacements: { gameId }, transaction },
		);
		await sequelize.query("DELETE FROM backlog_game WHERE id = :gameId", {
			replacements: { gameId },
			transaction,
		});
	} catch (error) {
		throw new DatabaseError("Failed to delete game", { cause: error });
	}
}
