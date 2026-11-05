import { createModelExportTable } from "../../../common/archive/createModelExportTable.ts";
import { createSqlExportTable } from "../../../common/archive/createSqlExportTable.ts";
import type { ProjectUserData } from "../../../common/userData/projectUserData.type.ts";
import { DatabaseError } from "../../../error/DatabaseError.ts";
import { Series } from "../models/Series.ts";
import { UserGame } from "../models/UserGame.ts";
import { UserVersion } from "../models/UserVersion.ts";

/**
 * Le backlog du compte, enfants d'abord (cahier de l'authentification, §5.1) : ses jeux, ses versions jouées (et par
 * cascade leurs DLC faits), puis ses séries. Un jeu du backlog tient sa série en RESTRICT : laisser les cascades du
 * compte choisir l'ordre ferait échouer la suppression. Les données IGDB, communes, restent
 */
export const backlogUserData: ProjectUserData = {
	async deleteAll(userId, transaction) {
		try {
			await UserGame.destroy({ where: { userId }, transaction });
			await UserVersion.destroy({ where: { userId }, transaction });
			await Series.destroy({ where: { userId }, transaction });
		} catch (error) {
			throw new DatabaseError("Failed to delete Backlog data", {
				cause: error,
			});
		}
	},

	exportTables: [
		createModelExportTable({
			tableName: "backlog_user_game",
			model: UserGame,
			ownerAttribute: "userId",
			orderAttribute: "gameId",
			columns: [
				"gameId",
				"imageId",
				"endingType",
				"seriesId",
				"seriesNumber",
				"createdAt",
				"updatedAt",
			],
		}),
		createModelExportTable({
			tableName: "backlog_user_version",
			model: UserVersion,
			ownerAttribute: "userId",
			columns: [
				"id",
				"versionId",
				"platformId",
				"status",
				"isOwned",
				"isUpNext",
				"finishDate",
				"sureFinishCount",
				"probableFinishCount",
				"trackedPlayTimeMinutes",
				"estimatedPlayTimeMinutes",
				"rating",
				"comment",
				"createdAt",
				"updatedAt",
			],
		}),
		createSqlExportTable({
			tableName: "backlog_done_dlc",
			columns: ["user_version_id", "dlc_id", "created_at"],
			sql: `
				SELECT dd.user_version_id, dd.dlc_id, dd.created_at
				FROM backlog_done_dlc dd
				JOIN backlog_user_version uv ON uv.id = dd.user_version_id
				WHERE uv.user_id = :userId
				ORDER BY dd.user_version_id, dd.dlc_id
			`,
		}),
		// Les séries qu'il a créées à la main, et les séries IGDB communes où il a rangé un jeu : chaque series_id de
		// backlog_user_game.csv y trouve son nom
		createSqlExportTable({
			tableName: "backlog_series",
			columns: [
				"id",
				"name",
				"igdb_collection_id",
				"igdb_franchise_id",
				"created_at",
				"updated_at",
			],
			sql: `
				SELECT s.id, s.name, s.igdb_collection_id, s.igdb_franchise_id, s.created_at, s.updated_at
				FROM backlog_series s
				WHERE s.user_id = :userId
				OR s.id IN (SELECT ug.series_id FROM backlog_user_game ug WHERE ug.user_id = :userId)
				ORDER BY s.id
			`,
		}),
	],
};
