import { Op, type WhereOperators } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";

// Condition sur un `bossId` : un des boss des jeux de ce compte (voir ownedGameIds)
export function ownedBossIds(userId: number): WhereOperators {
	return {
		[Op.in]: sequelize.literal(
			`(SELECT b.id FROM gdc_boss b JOIN gdc_game g ON g.id = b.game_id WHERE g.user_id = ${sequelize.escape(userId)})`,
		),
	};
}
