import { trimToNull } from "@citadel/common/src/universal/string/trimToNull.ts";

import { toTmdbRuntime } from "../toTmdbRuntime.ts";
import type { TmdbSeasonData } from "../type/tmdbSeasonData.type.ts";
import type { TmdbSeasonResponse } from "../type/tmdbSeasonResponse.type.ts";

// Un nom vide chez TMDB : « Saison 2 », « Épisode 5 », comme TMDB les nomme en français
export function fromTmdbSeasonResponse(
	season: TmdbSeasonResponse,
): TmdbSeasonData {
	return {
		id: season.id,
		seasonNumber: season.season_number,
		name: trimToNull(season.name) ?? `Saison ${season.season_number}`,
		airDate: trimToNull(season.air_date),
		posterPath: trimToNull(season.poster_path),
		episodes: (season.episodes ?? []).map((episode) => ({
			id: episode.id,
			episodeNumber: episode.episode_number,
			name: trimToNull(episode.name) ?? `Épisode ${episode.episode_number}`,
			airDate: trimToNull(episode.air_date),
			runtimeMinutes: toTmdbRuntime(episode.runtime),
			stillPath: trimToNull(episode.still_path),
		})),
	};
}
