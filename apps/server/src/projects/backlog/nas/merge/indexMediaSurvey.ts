import type { MediaSurvey } from "@citadel/specs/src/projects/backlog/mediaState/mediaSurvey.type.ts";

import { episodeIndexKey } from "./episodeIndexKey.ts";
import type { SurveyIndex } from "./surveyIndex.type.ts";

// Range le relevé par identifiant TMDB ; un identifiant en double (relevé abîmé) garde sa dernière ligne
export function indexMediaSurvey(survey: MediaSurvey): SurveyIndex {
	return {
		movies: new Map(survey.movies.map((movie) => [movie.tmdbId, movie])),
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
