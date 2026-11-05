import { createModelExportTable } from "../../../common/archive/createModelExportTable.ts";
import { createSqlExportTable } from "../../../common/archive/createSqlExportTable.ts";
import type { ProjectUserData } from "../../../common/userData/projectUserData.type.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { Game } from "../models/Game.ts";

// Les jeux du compte ; leurs boss et leurs morts suivent par cascade (V008)
export const gameDeathCounterUserData: ProjectUserData = {
	async deleteAll(userId, transaction) {
		try {
			await Game.destroy({ where: { userId }, transaction });
		} catch (error) {
			throw new DatabaseError("Failed to delete Game Death Counter data", {
				cause: error,
			});
		}
	},

	exportTables: [
		createModelExportTable({
			tableName: "gdc_game",
			model: Game,
			ownerAttribute: "userId",
			columns: ["id", "name", "endedAt", "createdAt", "updatedAt"],
		}),
		createSqlExportTable({
			tableName: "gdc_boss",
			columns: [
				"id",
				"game_id",
				"name",
				"defeated_at",
				"total_death",
				"created_at",
				"updated_at",
			],
			sql: `
				SELECT b.id, b.game_id, b.name, b.defeated_at, b.total_death, b.created_at, b.updated_at
				FROM gdc_boss b
				JOIN gdc_game g ON g.id = b.game_id
				WHERE g.user_id = :userId
				ORDER BY b.id
			`,
		}),
		createSqlExportTable({
			tableName: "gdc_death",
			columns: ["id", "boss_id", "date", "comment", "created_at", "updated_at"],
			sql: `
				SELECT d.id, d.boss_id, d.date, d.comment, d.created_at, d.updated_at
				FROM gdc_death d
				JOIN gdc_boss b ON b.id = d.boss_id
				JOIN gdc_game g ON g.id = b.game_id
				WHERE g.user_id = :userId
				ORDER BY d.id
			`,
		}),
	],
};
