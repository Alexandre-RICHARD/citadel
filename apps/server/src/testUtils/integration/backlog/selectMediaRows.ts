import { QueryTypes } from "sequelize";

import { sequelize } from "../../../configuration/sequelize.ts";

type UserMediaRow = {
	id: number;
	movieId: number | null;
	tvShowId: number | null;
	imagePath: string | null;
	sagaId: number | null;
	sagaNumber: number | null;
	isWatched: number;
	isUpNext: number;
	isInProgress: number;
	comment: string | null;
};

async function selectIds(
	sql: string,
	replacements: Record<string, unknown>,
): Promise<number[]> {
	const rows = await sequelize.query<{ id: number }>(sql, {
		type: QueryTypes.SELECT,
		replacements,
	});
	return rows.map(({ id }) => Number(id));
}

// Lectures directes en base des films et séries, sans passer par l'API ni par les modèles, pour vérifier un test
export const selectMediaRows = {
	async movieExists(movieId: number): Promise<boolean> {
		const ids = await selectIds(
			"SELECT id FROM backlog_movie WHERE id = :movieId",
			{
				movieId,
			},
		);
		return ids.length > 0;
	},

	async episodeIdsOfShow(tvShowId: number): Promise<number[]> {
		return selectIds(
			`SELECT e.id FROM backlog_tv_episode e
			JOIN backlog_tv_season s ON s.id = e.tv_season_id
			WHERE s.tv_show_id = :tvShowId ORDER BY s.season_number, e.episode_number`,
			{ tvShowId },
		);
	},

	async userMedia(userMediaId: number): Promise<UserMediaRow | null> {
		const [row] = await sequelize.query<UserMediaRow>(
			`SELECT id, movie_id AS movieId, tv_show_id AS tvShowId, image_path AS imagePath, saga_id AS sagaId,
				saga_number AS sagaNumber, is_watched AS isWatched, is_up_next AS isUpNext,
				is_in_progress AS isInProgress, comment
			FROM backlog_user_media WHERE id = :userMediaId`,
			{ type: QueryTypes.SELECT, replacements: { userMediaId } },
		);
		return row ?? null;
	},

	async userMediaIds(userId: number): Promise<number[]> {
		return selectIds(
			"SELECT id FROM backlog_user_media WHERE user_id = :userId ORDER BY id",
			{ userId },
		);
	},

	async watchedEpisodeIds(userId: number): Promise<number[]> {
		return selectIds(
			`SELECT tv_episode_id AS id FROM backlog_watched_episode
			WHERE user_id = :userId ORDER BY tv_episode_id`,
			{ userId },
		);
	},

	async sagaNames(userId: number): Promise<string[]> {
		const rows = await sequelize.query<{ name: string }>(
			"SELECT name FROM backlog_saga WHERE user_id = :userId ORDER BY name",
			{ type: QueryTypes.SELECT, replacements: { userId } },
		);
		return rows.map(({ name }) => name);
	},

	async sagaOfCollection(
		userId: number,
		collectionId: number,
	): Promise<number | null> {
		const [sagaId] = await selectIds(
			`SELECT saga_id AS id FROM backlog_saga_collection
			WHERE user_id = :userId AND collection_id = :collectionId`,
			{ userId, collectionId },
		);
		return sagaId ?? null;
	},
};
