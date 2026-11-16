import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";

type IdRow = { id: number };

/**
 * Les séries que TMDB marque « en cours » et qu'au moins un backlog contient : celles du compte, ou de tous les comptes
 * (userId null) pour le passage de nuit. Une série qu'aucun backlog ne contient n'est plus relue
 */
export async function getOngoingShowIdsQuery(
	userId: number | null,
): Promise<number[]> {
	try {
		const rows = await sequelize.query<IdRow>(
			`
				SELECT DISTINCT s.id
				FROM backlog_tv_show s
				JOIN backlog_user_media um ON um.tv_show_id = s.id
				WHERE s.is_ongoing = TRUE
				AND (:userId IS NULL OR um.user_id = :userId)
				ORDER BY s.id
			`,
			{ type: QueryTypes.SELECT, replacements: { userId } },
		);
		return rows.map(({ id }) => id);
	} catch (error) {
		throw new DatabaseError("Failed to fetch ongoing shows", { cause: error });
	}
}
