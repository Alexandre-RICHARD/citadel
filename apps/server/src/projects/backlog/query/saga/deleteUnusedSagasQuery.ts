import type { Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

/**
 * Une saga du compte qu'aucun de ses médias n'a choisie quitte la base, avec les liens vers ses collections (cascade) :
 * elle part avec son dernier média, comme une série créée à la main côté jeux
 */
export async function deleteUnusedSagasQuery(
	userId: number,
	transaction: Transaction,
): Promise<void> {
	try {
		await sequelize.query(
			`
				DELETE FROM backlog_saga
				WHERE user_id = :userId
				AND NOT EXISTS (
					SELECT 1 FROM backlog_user_media um WHERE um.saga_id = backlog_saga.id
				)
			`,
			{ replacements: { userId }, transaction },
		);
	} catch (error) {
		throw new DatabaseError("Failed to delete unused sagas", { cause: error });
	}
}
