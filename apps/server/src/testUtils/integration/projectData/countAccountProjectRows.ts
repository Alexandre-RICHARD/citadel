import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type CountRow = { rowCount: number };

// Les lignes du compte dans chaque table des projets, par jointure pour celles qui n'ont pas de user_id
const OWNED_ROWS_SQL = {
	gdc_game: "SELECT COUNT(*) AS rowCount FROM gdc_game WHERE user_id = :userId",
	gdc_boss: `SELECT COUNT(*) AS rowCount FROM gdc_boss b
		JOIN gdc_game g ON g.id = b.game_id WHERE g.user_id = :userId`,
	gdc_death: `SELECT COUNT(*) AS rowCount FROM gdc_death d
		JOIN gdc_boss b ON b.id = d.boss_id JOIN gdc_game g ON g.id = b.game_id WHERE g.user_id = :userId`,
	backlog_user_game:
		"SELECT COUNT(*) AS rowCount FROM backlog_user_game WHERE user_id = :userId",
	backlog_user_version:
		"SELECT COUNT(*) AS rowCount FROM backlog_user_version WHERE user_id = :userId",
	backlog_done_dlc: `SELECT COUNT(*) AS rowCount FROM backlog_done_dlc dd
		JOIN backlog_user_version uv ON uv.id = dd.user_version_id WHERE uv.user_id = :userId`,
	backlog_series:
		"SELECT COUNT(*) AS rowCount FROM backlog_series WHERE user_id = :userId",
} as const;

type ProjectTableName = keyof typeof OWNED_ROWS_SQL;

// Lecture en SQL brut, indépendante des modèles : { table: nombre de lignes du compte }
export async function countAccountProjectRows(
	userId: number,
	tables: readonly ProjectTableName[] = Object.keys(
		OWNED_ROWS_SQL,
	) as ProjectTableName[],
): Promise<Partial<Record<ProjectTableName, number>>> {
	const counts = await Promise.all(
		tables.map(async (table) => {
			const row = await sequelize.query<CountRow>(OWNED_ROWS_SQL[table], {
				type: QueryTypes.SELECT,
				plain: true,
				replacements: { userId },
			});
			return [table, Number(row?.rowCount ?? 0)] as const;
		}),
	);
	return Object.fromEntries(counts);
}
