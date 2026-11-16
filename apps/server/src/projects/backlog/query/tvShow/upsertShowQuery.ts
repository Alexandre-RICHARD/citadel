import type { Transaction } from "sequelize";

import { DatabaseError } from "../../../../error/DatabaseError.ts";
import { TvEpisode } from "../../models/TvEpisode.ts";
import { TvSeason } from "../../models/TvSeason.ts";
import { TvShow } from "../../models/TvShow.ts";
import type { TmdbShowData } from "../../tmdb/type/tmdbShowData.type.ts";

// Assez peu de lignes par INSERT pour rester loin de la taille maximale d'une requête, même pour un millier d'épisodes
const EPISODES_PER_INSERT = 500;

/**
 * Une série lue sur TMDB, ses saisons et ses épisodes : ajoutés en base, ou remis à jour s'ils y sont déjà (titres,
 * dates, durées, statut « en cours »). Une saison ou un épisode que TMDB ne donne plus reste en base, avec ses cases vues
 */
export async function upsertShowQuery(
	show: TmdbShowData,
	transaction: Transaction,
): Promise<void> {
	try {
		await TvShow.upsert(
			{
				id: show.id,
				name: show.name,
				originalName: show.originalName,
				originalLanguage: show.originalLanguage,
				firstAirDate: show.firstAirDate,
				imdbId: show.imdbId,
				posterPath: show.posterPath,
				isOngoing: show.isOngoing,
			},
			{ transaction },
		);
		await TvSeason.bulkCreate(
			show.seasons.map((season) => ({
				id: season.id,
				tvShowId: show.id,
				seasonNumber: season.seasonNumber,
				name: season.name,
				airDate: season.airDate,
				posterPath: season.posterPath,
			})),
			{
				updateOnDuplicate: [
					"seasonNumber",
					"name",
					"airDate",
					"posterPath",
					"updatedAt",
				],
				transaction,
			},
		);
		const episodes = show.seasons.flatMap((season) =>
			season.episodes.map((episode) => ({ ...episode, tvSeasonId: season.id })),
		);
		for (let start = 0; start < episodes.length; start += EPISODES_PER_INSERT)
			// eslint-disable-next-line no-await-in-loop -- les lots d'une même transaction passent l'un après l'autre
			await TvEpisode.bulkCreate(
				episodes.slice(start, start + EPISODES_PER_INSERT),
				{
					updateOnDuplicate: [
						"tvSeasonId",
						"episodeNumber",
						"name",
						"airDate",
						"runtimeMinutes",
						"stillPath",
						"updatedAt",
					],
					transaction,
				},
			);
	} catch (error) {
		throw new DatabaseError("Failed to store show", { cause: error });
	}
}
