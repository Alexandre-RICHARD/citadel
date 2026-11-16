import { buildSeasonAppendBatches } from "./buildSeasonAppendBatches.ts";
import { fromTmdbShowResponse } from "./mapper/fromTmdbShowResponse.ts";
import { tmdbClient } from "./tmdbClient.ts";
import type { TmdbSeasonResponse } from "./type/tmdbSeasonResponse.type.ts";
import type { TmdbShowData } from "./type/tmdbShowData.type.ts";
import type { TmdbTvShowResponse } from "./type/tmdbTvShowResponse.type.ts";

// Une saison ajoutée à la fiche de la série arrive sous la clé « season/<n> »
type ShowWithSeasons = Record<string, TmdbSeasonResponse | undefined>;

/**
 * Une série, toutes ses saisons et tous leurs épisodes : la fiche (et son identifiant IMDB), puis les saisons 20 par
 * 20 ajoutées à la fiche. null : TMDB ne la connaît pas (ou plus). Les requêtes se suivent, au rythme du client
 */
export async function fetchTmdbShow(
	tmdbId: number,
): Promise<TmdbShowData | null> {
	const path = `/tv/${tmdbId}`;
	const show = await tmdbClient.get<TmdbTvShowResponse>(path, {
		append_to_response: "external_ids",
	});
	if (show === null) return null;

	const seasonNumbers = (show.seasons ?? []).map(
		({ season_number }) => season_number,
	);
	const seasons: TmdbSeasonResponse[] = [];
	for (const batch of buildSeasonAppendBatches(seasonNumbers)) {
		// eslint-disable-next-line no-await-in-loop -- le client espace déjà les requêtes : les lancer ensemble n'irait pas plus vite
		const withSeasons = await tmdbClient.get<ShowWithSeasons>(path, {
			append_to_response: batch,
		});
		// Une série retirée entre deux requêtes : elle n'existe plus
		if (withSeasons === null) return null;
		for (const key of batch.split(",")) {
			const season = withSeasons[key];
			if (season !== undefined) seasons.push(season);
		}
	}
	return fromTmdbShowResponse(show, seasons);
}
