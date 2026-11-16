import { QueryTypes, type Transaction } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type IdRow = { id: number };

// Les épisodes d'une série, pour vérifier que les cases cochées lui appartiennent
export async function getShowEpisodeIdsQuery(
	tvShowId: number,
	transaction: Transaction,
): Promise<Set<number>> {
	try {
		const rows = await sequelize.query<IdRow>(
			`
				SELECT e.id
				FROM backlog_tv_episode e
				JOIN backlog_tv_season s ON s.id = e.tv_season_id
				WHERE s.tv_show_id = :tvShowId
			`,
			{ type: QueryTypes.SELECT, replacements: { tvShowId }, transaction },
		);
		return new Set(rows.map(({ id }) => id));
	} catch (error) {
		throw new DatabaseError("Failed to fetch show episodes", { cause: error });
	}
}
