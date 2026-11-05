import { Op, type WhereOperators } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";

/**
 * Condition sur un `gameId` : un des jeux de ce compte. Boss et morts n'ont pas de user_id, leur propriétaire est celui
 * de leur jeu ; une seule requête, sans lire le jeu avant
 */
export function ownedGameIds(userId: number): WhereOperators {
	return {
		[Op.in]: sequelize.literal(
			`(SELECT id FROM gdc_game WHERE user_id = ${sequelize.escape(userId)})`,
		),
	};
}
