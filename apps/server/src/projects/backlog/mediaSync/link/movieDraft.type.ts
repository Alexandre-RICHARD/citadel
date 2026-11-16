import type { SurveyedFolder } from "@citadel/specs/src/projects/backlog/mediaState/surveyedFolder.type.ts";

import type { MediaDraft } from "./mediaDraft.type.ts";

// Un film avant d'être écrit dans le relevé, avec ce que dit chaque source de son identifiant (surveyedMovieSchema)
export type MovieDraft = MediaDraft & {
	toolTmdbId: number | null;
	jellyfinTmdbId: number | null;
	folder: SurveyedFolder | null;
	title: string | null;
	year: number | null;
};
