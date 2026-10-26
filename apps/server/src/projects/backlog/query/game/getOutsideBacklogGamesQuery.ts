import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { OutsideBacklogGameRow } from "../../dbType/outsideBacklogGameRow.type.ts";
import { buildOutsideBacklogFilter } from "./buildOutsideBacklogFilter.ts";

// Une page de « Ma base », triée par nom affiché (VF, sinon VO) ; la cover est celle de la version originale
export async function getOutsideBacklogGamesQuery(
	query: string,
	offset: number,
	limit: number,
): Promise<OutsideBacklogGameRow[]> {
	const { condition, pattern } = buildOutsideBacklogFilter(query);
	try {
		return await sequelize.query<OutsideBacklogGameRow>(
			`
				SELECT
					g.id,
					g.name,
					g.french_name AS frenchName,
					DATE_FORMAT(g.first_release_date, '%Y-%m-%d') AS firstReleaseDate,
					v.cover_image_id AS coverImageId
				FROM backlog_game g
				LEFT JOIN backlog_version v ON v.id = g.id
				WHERE ${condition}
				ORDER BY COALESCE(g.french_name, g.name), g.id
				LIMIT :limit OFFSET :offset
			`,
			{
				replacements: { pattern, limit, offset },
				type: QueryTypes.SELECT,
			},
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch games outside the backlog", {
			cause: error,
		});
	}
}
