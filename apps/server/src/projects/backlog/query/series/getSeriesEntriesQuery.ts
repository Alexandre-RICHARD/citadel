import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { SeriesEntryRow } from "../../dbType/seriesEntryRow.type.ts";

// Jeux du backlog d'une série, par numéro, avec leurs noms et leur date de sortie originale
export async function getSeriesEntriesQuery(
	seriesId: number,
): Promise<SeriesEntryRow[]> {
	try {
		return await sequelize.query<SeriesEntryRow>(
			`
				SELECT
					ug.game_id AS gameId,
					ug.series_number AS seriesNumber,
					g.name,
					g.french_name AS frenchName,
					DATE_FORMAT(g.first_release_date, '%Y-%m-%d') AS firstReleaseDate
				FROM backlog_user_game ug
				JOIN backlog_game g ON g.id = ug.game_id
				WHERE ug.series_id = :seriesId
				ORDER BY ug.series_number, ug.game_id
			`,
			{ replacements: { seriesId }, type: QueryTypes.SELECT },
		);
	} catch (error) {
		throw new DatabaseError("Failed to fetch series entries", {
			cause: error,
		});
	}
}
