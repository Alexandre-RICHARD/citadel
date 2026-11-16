import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

async function insert(
	sql: string,
	replacements: Record<string, unknown>,
): Promise<void> {
	await sequelize.query(sql, { type: QueryTypes.INSERT, replacements });
}

async function insertReturningId(
	sql: string,
	replacements: Record<string, unknown>,
): Promise<number> {
	const [id] = await sequelize.query(sql, {
		type: QueryTypes.INSERT,
		replacements,
	});
	return Number(id);
}

// Insertions directes en base des films et séries, sans passer par l'API ni par les modèles, pour préparer un test
export const insertMediaRows = {
	async collection(row: { id: number; name: string }): Promise<void> {
		await insert(
			"INSERT INTO backlog_media_collection (id, name) VALUES (:id, :name)",
			row,
		);
	},

	async movie(row: {
		id: number;
		title: string;
		originalTitle?: string;
		releaseDate?: string | null;
		runtimeMinutes?: number | null;
		posterPath?: string | null;
		collectionId?: number | null;
	}): Promise<void> {
		await insert(
			`INSERT INTO backlog_movie (id, title, original_title, original_language, release_date, runtime_minutes,
				poster_path, collection_id)
			VALUES (:id, :title, :originalTitle, 'en', :releaseDate, :runtimeMinutes, :posterPath, :collectionId)`,
			{
				originalTitle: row.title,
				releaseDate: null,
				runtimeMinutes: null,
				posterPath: null,
				collectionId: null,
				...row,
			},
		);
	},

	async tvShow(row: {
		id: number;
		name: string;
		isOngoing?: boolean;
	}): Promise<void> {
		await insert(
			`INSERT INTO backlog_tv_show (id, name, original_name, original_language, is_ongoing)
			VALUES (:id, :name, :name, 'en', :isOngoing)`,
			{ isOngoing: false, ...row },
		);
	},

	async tvSeason(row: {
		id: number;
		tvShowId: number;
		seasonNumber: number;
	}): Promise<void> {
		await insert(
			`INSERT INTO backlog_tv_season (id, tv_show_id, season_number, name)
			VALUES (:id, :tvShowId, :seasonNumber, :name)`,
			{ ...row, name: `Saison ${row.seasonNumber}` },
		);
	},

	async tvEpisode(row: {
		id: number;
		tvSeasonId: number;
		episodeNumber: number;
		airDate?: string | null;
		runtimeMinutes?: number | null;
	}): Promise<void> {
		await insert(
			`INSERT INTO backlog_tv_episode (id, tv_season_id, episode_number, name, air_date, runtime_minutes)
			VALUES (:id, :tvSeasonId, :episodeNumber, :name, :airDate, :runtimeMinutes)`,
			{
				airDate: "2020-01-01",
				runtimeMinutes: 50,
				...row,
				name: `Épisode ${row.episodeNumber}`,
			},
		);
	},

	async saga(row: { userId: number; name: string }): Promise<number> {
		return insertReturningId(
			"INSERT INTO backlog_saga (user_id, name) VALUES (:userId, :name)",
			row,
		);
	},

	async sagaCollection(row: {
		userId: number;
		collectionId: number;
		sagaId: number;
	}): Promise<void> {
		await insert(
			`INSERT INTO backlog_saga_collection (user_id, collection_id, saga_id)
			VALUES (:userId, :collectionId, :sagaId)`,
			row,
		);
	},

	async userMedia(row: {
		userId: number;
		movieId?: number | null;
		tvShowId?: number | null;
		sagaId?: number | null;
		sagaNumber?: number | null;
		isWatched?: boolean;
	}): Promise<number> {
		return insertReturningId(
			`INSERT INTO backlog_user_media (user_id, movie_id, tv_show_id, saga_id, saga_number, is_watched)
			VALUES (:userId, :movieId, :tvShowId, :sagaId, :sagaNumber, :isWatched)`,
			{
				movieId: null,
				tvShowId: null,
				sagaId: null,
				sagaNumber: null,
				isWatched: false,
				...row,
			},
		);
	},

	async watchedEpisode(row: {
		userId: number;
		tvEpisodeId: number;
	}): Promise<void> {
		await insert(
			`INSERT INTO backlog_watched_episode (user_id, tv_episode_id)
			VALUES (:userId, :tvEpisodeId)`,
			row,
		);
	},
};
