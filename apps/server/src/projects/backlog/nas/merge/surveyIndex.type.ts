import type { NasEntry } from "@citadel/specs/src/projects/backlog/mediaState/nasEntry.type.ts";
import type { SurveyedMovie } from "@citadel/specs/src/projects/backlog/mediaState/surveyedMovie.type.ts";
import type { SurveyedShow } from "@citadel/specs/src/projects/backlog/mediaState/surveyedShow.type.ts";

// Le relevé rangé par identifiant TMDB, les épisodes par « saison:épisode », pour le fusionner ligne à ligne
export type SurveyIndex = {
	movies: Map<number, SurveyedMovie>;
	shows: Map<number, { show: SurveyedShow; episodes: Map<string, NasEntry> }>;
};
