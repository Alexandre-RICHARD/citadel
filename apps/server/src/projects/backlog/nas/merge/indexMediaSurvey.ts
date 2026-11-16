import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";

import { episodeIndexKey } from "./episodeIndexKey.ts";
import type { SurveyIndex } from "./surveyIndex.type.ts";

// Range le relevé par identifiant TMDB ; un identifiant en double (relevé abîmé) garde sa dernière ligne
export function indexMediaSurvey(survey: MediaSurvey): SurveyIndex {
	return {
		// Un film sans identifiant n'est relié à aucune ligne : il ne sert qu'aux oubliés
		movies: new Map(
			survey.movies.flatMap((movie) =>
				movie.tmdbId === null ? [] : [[movie.tmdbId, movie] as const],
			),
		),
		shows: new Map(
			survey.shows.map((show) => [
				show.tmdbId,
				{
					show,
					episodes: new Map(
						show.episodes.map(({ seasonNumber, episodeNumber, entry }) => [
							episodeIndexKey(seasonNumber, episodeNumber),
							entry,
						]),
					),
				},
			]),
		),
	};
}
