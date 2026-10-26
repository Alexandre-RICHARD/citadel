import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type UserGameRow = {
	gameId: number;
	imageId: string | null;
	endingType: string;
	seriesId: number | null;
	seriesNumber: number | null;
};

type UserVersionRow = {
	id: number;
	versionId: number;
	platformId: number;
	status: string;
	isOwned: boolean;
	isUpNext: boolean;
	finishDate: string | null;
	sureFinishCount: number;
	probableFinishCount: number;
	trackedPlayTimeMinutes: number;
	estimatedPlayTimeMinutes: number;
	rating: number | null;
	comment: string | null;
};

type SeriesRow = {
	id: number;
	name: string;
	igdbCollectionId: number | null;
	igdbFranchiseId: number | null;
};

// Lectures en SQL brut : vérifient les vraies colonnes, indépendamment du mapping des modèles
export const selectBacklogRows = {
	async userGame(gameId: number): Promise<UserGameRow | null> {
		const row = await sequelize.query<
			Omit<UserGameRow, "seriesNumber"> & { seriesNumber: string | null }
		>(
			`SELECT game_id AS gameId, image_id AS imageId, ending_type AS endingType, series_id AS seriesId,
				series_number AS seriesNumber
			FROM backlog_user_game WHERE game_id = :gameId`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { gameId } },
		);
		return row === null
			? null
			: {
					...row,
					seriesNumber:
						row.seriesNumber === null ? null : Number(row.seriesNumber),
				};
	},

	async userVersions(gameId: number): Promise<UserVersionRow[]> {
		const rows = await sequelize.query<
			Omit<UserVersionRow, "isOwned" | "isUpNext"> & {
				isOwned: number;
				isUpNext: number;
			}
		>(
			`SELECT uv.id, uv.version_id AS versionId, uv.platform_id AS platformId, uv.status,
				uv.is_owned AS isOwned, uv.is_up_next AS isUpNext,
				DATE_FORMAT(uv.finish_date, '%Y-%m-%d') AS finishDate,
				uv.sure_finish_count AS sureFinishCount, uv.probable_finish_count AS probableFinishCount,
				uv.tracked_play_time_minutes AS trackedPlayTimeMinutes,
				uv.estimated_play_time_minutes AS estimatedPlayTimeMinutes, uv.rating, uv.comment
			FROM backlog_user_version uv
			JOIN backlog_version v ON v.id = uv.version_id
			WHERE v.game_id = :gameId
			ORDER BY uv.id`,
			{ type: QueryTypes.SELECT, replacements: { gameId } },
		);
		return rows.map((row) => ({
			...row,
			isOwned: Boolean(row.isOwned),
			isUpNext: Boolean(row.isUpNext),
		}));
	},

	async doneDlcIds(userVersionId: number): Promise<number[]> {
		const rows = await sequelize.query<{ dlcId: number }>(
			`SELECT dlc_id AS dlcId FROM backlog_done_dlc WHERE user_version_id = :userVersionId ORDER BY dlc_id`,
			{ type: QueryTypes.SELECT, replacements: { userVersionId } },
		);
		return rows.map(({ dlcId }) => dlcId);
	},

	async series(seriesId: number): Promise<SeriesRow | null> {
		return sequelize.query<SeriesRow>(
			`SELECT id, name, igdb_collection_id AS igdbCollectionId, igdb_franchise_id AS igdbFranchiseId
			FROM backlog_series WHERE id = :seriesId`,
			{ type: QueryTypes.SELECT, plain: true, replacements: { seriesId } },
		);
	},

	async seriesByName(name: string): Promise<SeriesRow[]> {
		return sequelize.query<SeriesRow>(
			`SELECT id, name, igdb_collection_id AS igdbCollectionId, igdb_franchise_id AS igdbFranchiseId
			FROM backlog_series WHERE name = :name ORDER BY id`,
			{ type: QueryTypes.SELECT, replacements: { name } },
		);
	},

	async gameIds(gameId: number): Promise<{
		versionIds: number[];
		dlcIds: number[];
	}> {
		const versions = await sequelize.query<{ id: number }>(
			`SELECT id FROM backlog_version WHERE game_id = :gameId ORDER BY id`,
			{ type: QueryTypes.SELECT, replacements: { gameId } },
		);
		const dlcs = await sequelize.query<{ id: number }>(
			`SELECT id FROM backlog_dlc WHERE game_id = :gameId ORDER BY id`,
			{ type: QueryTypes.SELECT, replacements: { gameId } },
		);
		return {
			versionIds: versions.map(({ id }) => id),
			dlcIds: dlcs.map(({ id }) => id),
		};
	},
};
