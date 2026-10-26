import { EndingTypeEnum } from "@citadel/specs/src/projects/backlog/enum/endingType.enum.ts";
import { StatusEnum } from "@citadel/specs/src/projects/backlog/enum/status.enum.ts";
import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

// Insertions directes en base, sans passer par l'API ni par les modèles, pour préparer un test
export const insertBacklogRows = {
	async company(row: {
		id: number;
		name: string;
		logoImageId?: string | null;
	}): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_company (id, name, logo_image_id) VALUES (:id, :name, :logoImageId)`,
			{
				type: QueryTypes.INSERT,
				replacements: { logoImageId: null, ...row },
			},
		);
	},

	async platform(row: {
		id: number;
		shortName: string;
		technicalName?: string;
		emulatedPlatformId?: number | null;
	}): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_platform (id, short_name, technical_name, emulated_platform_id)
			VALUES (:id, :shortName, :technicalName, :emulatedPlatformId)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					technicalName: row.shortName.toLowerCase(),
					emulatedPlatformId: null,
					...row,
				},
			},
		);
	},

	// Renvoie l'id créé
	async series(row: {
		name: string;
		igdbCollectionId?: number | null;
		igdbFranchiseId?: number | null;
	}): Promise<number> {
		const [insertedId] = await sequelize.query(
			`INSERT INTO backlog_series (name, igdb_collection_id, igdb_franchise_id)
			VALUES (:name, :igdbCollectionId, :igdbFranchiseId)`,
			{
				type: QueryTypes.INSERT,
				replacements: { igdbCollectionId: null, igdbFranchiseId: null, ...row },
			},
		);
		return insertedId;
	},

	async game(row: {
		id: number;
		name: string;
		frenchName?: string | null;
		firstReleaseDate?: string | null;
		isCancelled?: boolean;
		proposedSeriesId?: number | null;
		developerId?: number | null;
		publisherId?: number | null;
	}): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_game (id, name, french_name, first_release_date, is_cancelled, proposed_series_id, developer_id, publisher_id)
			VALUES (:id, :name, :frenchName, :firstReleaseDate, :isCancelled, :proposedSeriesId, :developerId, :publisherId)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					frenchName: null,
					firstReleaseDate: null,
					isCancelled: false,
					proposedSeriesId: null,
					developerId: null,
					publisherId: null,
					...row,
				},
			},
		);
	},

	async version(row: {
		id: number;
		gameId: number;
		title?: string | null;
		coverImageId?: string | null;
	}): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_version (id, game_id, title, cover_image_id, igdb_url)
			VALUES (:id, :gameId, :title, :coverImageId, :igdbUrl)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					title: null,
					coverImageId: null,
					igdbUrl: `https://www.igdb.com/games/${row.id}`,
					...row,
				},
			},
		);
	},

	async versionPlatform(row: {
		versionId: number;
		platformId: number;
		releaseDate?: string | null;
	}): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_version_platform (version_id, platform_id, release_date)
			VALUES (:versionId, :platformId, :releaseDate)`,
			{ type: QueryTypes.INSERT, replacements: { releaseDate: null, ...row } },
		);
	},

	async dlc(row: { id: number; gameId: number; name: string }): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_dlc (id, game_id, name) VALUES (:id, :gameId, :name)`,
			{ type: QueryTypes.INSERT, replacements: row },
		);
	},

	async userGame(row: {
		gameId: number;
		endingType?: EndingTypeEnum;
		imageId?: string | null;
		seriesId?: number | null;
		seriesNumber?: number | null;
		createdAt?: Date;
	}): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_user_game (game_id, image_id, ending_type, series_id, series_number, created_at, updated_at)
			VALUES (:gameId, :imageId, :endingType, :seriesId, :seriesNumber, :createdAt, :createdAt)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					imageId: null,
					endingType: EndingTypeEnum.STORY,
					seriesId: null,
					seriesNumber: null,
					createdAt: new Date(),
					...row,
				},
			},
		);
	},

	// Renvoie l'id créé
	async userVersion(row: {
		versionId: number;
		platformId: number;
		status?: StatusEnum;
		isOwned?: boolean;
		isUpNext?: boolean;
		finishDate?: string | null;
		sureFinishCount?: number;
		probableFinishCount?: number;
		trackedPlayTimeMinutes?: number;
		estimatedPlayTimeMinutes?: number;
		rating?: number | null;
		comment?: string | null;
	}): Promise<number> {
		const [insertedId] = await sequelize.query(
			`INSERT INTO backlog_user_version (version_id, platform_id, status, is_owned, is_up_next, finish_date,
				sure_finish_count, probable_finish_count, tracked_play_time_minutes, estimated_play_time_minutes, rating, comment)
			VALUES (:versionId, :platformId, :status, :isOwned, :isUpNext, :finishDate,
				:sureFinishCount, :probableFinishCount, :trackedPlayTimeMinutes, :estimatedPlayTimeMinutes, :rating, :comment)`,
			{
				type: QueryTypes.INSERT,
				replacements: {
					status: StatusEnum.NOT_STARTED,
					isOwned: false,
					isUpNext: false,
					finishDate: null,
					sureFinishCount: 0,
					probableFinishCount: 0,
					trackedPlayTimeMinutes: 0,
					estimatedPlayTimeMinutes: 0,
					rating: null,
					comment: null,
					...row,
				},
			},
		);
		return insertedId;
	},

	async doneDlc(row: { userVersionId: number; dlcId: number }): Promise<void> {
		await sequelize.query(
			`INSERT INTO backlog_done_dlc (user_version_id, dlc_id) VALUES (:userVersionId, :dlcId)`,
			{ type: QueryTypes.INSERT, replacements: row },
		);
	},
};
