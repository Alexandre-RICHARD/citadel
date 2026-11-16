import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import { isOngoingTmdbShow } from "../isOngoingTmdbShow.ts";
import type { TmdbSeasonResponse } from "../type/tmdbSeasonResponse.type.ts";
import type { TmdbShowData } from "../type/tmdbShowData.type.ts";
import type { TmdbTvShowResponse } from "../type/tmdbTvShowResponse.type.ts";
import { fromTmdbSeasonResponse } from "./fromTmdbSeasonResponse.ts";

// Une série et ses saisons, lues à part ; les saisons vont dans l'ordre de leur numéro, les spéciaux (0) en premier
export function fromTmdbShowResponse(
	show: TmdbTvShowResponse,
	seasons: TmdbSeasonResponse[],
): TmdbShowData {
	// L'identifiant de chaque saison est dans la liste de la fiche, pas dans la saison lue à part
	const seasonIds = new Map(
		(show.seasons ?? []).map((season) => [season.season_number, season.id]),
	);
	return {
		id: show.id,
		name: trimToNull(show.name) ?? show.original_name,
		originalName: show.original_name,
		originalLanguage: trimToNull(show.original_language),
		firstAirDate: trimToNull(show.first_air_date),
		imdbId: trimToNull(show.external_ids?.imdb_id),
		posterPath: trimToNull(show.poster_path),
		isOngoing: isOngoingTmdbShow(show.status, show.in_production),
		seasons: seasons
			.flatMap((season) => {
				const id = seasonIds.get(season.season_number);
				// Sans identifiant dans la liste de la série, la saison ne peut pas être rangée en base
				return id === undefined ? [] : [fromTmdbSeasonResponse(season, id)];
			})
			.sort((first, second) => first.seasonNumber - second.seasonNumber),
	};
}
