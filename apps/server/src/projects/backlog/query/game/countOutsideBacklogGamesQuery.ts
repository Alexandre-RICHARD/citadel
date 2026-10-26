import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { CountRow } from "../../dbType/countRow.type.ts";
import { buildOutsideBacklogFilter } from "./buildOutsideBacklogFilter.ts";

// Jeux de « Ma base » qui correspondent à la saisie ; une saisie vide les compte tous
export async function countOutsideBacklogGamesQuery(
	query: string,
): Promise<number> {
	const { condition, pattern } = buildOutsideBacklogFilter(query);
	try {
		const row = await sequelize.query<CountRow>(
			`SELECT COUNT(*) AS count FROM backlog_game g WHERE ${condition}`,
			{ replacements: { pattern }, type: QueryTypes.SELECT, plain: true },
		);
		return Number(row?.count ?? 0);
	} catch (error) {
		throw new DatabaseError("Failed to count games outside the backlog", {
			cause: error,
		});
	}
}
