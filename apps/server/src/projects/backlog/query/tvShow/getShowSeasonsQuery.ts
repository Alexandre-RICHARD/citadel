import { QueryTypes } from "sequelize";

import { sequelize } from "../../../../configuration/sequelize.ts";
import { DatabaseError } from "../../../../error/DatabaseError.ts";
import type { ShowSeasonBean } from "../../bean/showSeasonBean.type.ts";

// La saison 0 réunit les épisodes spéciaux, rangés après les saisons principales
const SPECIALS_SEASON_NUMBER = 0;

type EpisodeRow = {
	seasonId: number;
	seasonNumber: number;
	seasonName: string;
	seasonAirDate: string | null;
	seasonPosterPath: string | null;
	episodeId: number | null;
	episodeNumber: number | null;
	episodeName: string | null;
	airDate: string | null;
	runtimeMinutes: number | null;
	stillPath: string | null;
	isWatched: number;
};

/**
 * Les saisons d'une série et leurs épisodes, avec ceux que le compte a vus : par numéro, les épisodes spéciaux à la fin.
 * Une saison sans épisode connu reste, vide
 */
export async function getShowSeasonsQuery(
	userId: number,
	tvShowId: number,
): Promise<ShowSeasonBean[]> {
	try {
		const rows = await sequelize.query<EpisodeRow>(
			`
				SELECT s.id AS seasonId, s.season_number AS seasonNumber, s.name AS seasonName,
					DATE_FORMAT(s.air_date, '%Y-%m-%d') AS seasonAirDate, s.poster_path AS seasonPosterPath,
					e.id AS episodeId, e.episode_number AS episodeNumber, e.name AS episodeName,
					DATE_FORMAT(e.air_date, '%Y-%m-%d') AS airDate, e.runtime_minutes AS runtimeMinutes,
					e.still_path AS stillPath, we.user_id IS NOT NULL AS isWatched
				FROM backlog_tv_season s
				LEFT JOIN backlog_tv_episode e ON e.tv_season_id = s.id
				LEFT JOIN backlog_watched_episode we ON we.tv_episode_id = e.id AND we.user_id = :userId
				WHERE s.tv_show_id = :tvShowId
				ORDER BY s.season_number = ${SPECIALS_SEASON_NUMBER}, s.season_number, e.episode_number, e.id
			`,
			{ type: QueryTypes.SELECT, replacements: { userId, tvShowId } },
		);
		const seasons = new Map<number, ShowSeasonBean>();
		for (const row of rows) {
			const season = seasons.get(row.seasonId) ?? {
				id: row.seasonId,
				seasonNumber: row.seasonNumber,
				name: row.seasonName,
				airDate: row.seasonAirDate,
				posterPath: row.seasonPosterPath,
				episodes: [],
			};
			seasons.set(row.seasonId, season);
			if (row.episodeId !== null)
				season.episodes.push({
					id: row.episodeId,
					episodeNumber: row.episodeNumber ?? 0,
					name: row.episodeName ?? "",
					airDate: row.airDate,
					runtimeMinutes: row.runtimeMinutes,
					stillPath: row.stillPath,
					isWatched: Boolean(row.isWatched),
				});
		}
		return [...seasons.values()];
	} catch (error) {
		throw new DatabaseError("Failed to fetch show seasons", { cause: error });
	}
}
