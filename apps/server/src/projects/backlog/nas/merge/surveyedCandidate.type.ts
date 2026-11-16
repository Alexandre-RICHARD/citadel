import type { SurveyedFolder } from "@citadel/specs/src/projects/backlog/mediaState/surveyedFolder.type.ts";

// Ce que le relevé dit de l'identifiant d'un film ou d'une série, chaque source à part (surveyedMovieSchema)
export type SurveyedCandidate = {
	tmdbId: number | null;
	toolTmdbId: number | null;
	jellyfinTmdbId: number | null;
	folder: SurveyedFolder | null;
};
