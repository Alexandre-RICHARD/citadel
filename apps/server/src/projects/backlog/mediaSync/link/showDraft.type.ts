import type { SurveyedFolder } from "@citadel/specs/src/projects/backlog/mediaState/surveyedFolder.type.ts";

import type { EpisodeDraft } from "./episodeDraft.type.ts";

// Une série avant d'être écrite dans le relevé, avec ses épisodes rangés par « saison:épisode »
export type ShowDraft = {
	toolTmdbId: number | null;
	jellyfinTmdbId: number | null;
	jellyfinSeriesId: string | null;
	folder: SurveyedFolder | null;
	title: string | null;
	year: number | null;
	episodes: Map<string, EpisodeDraft>;
};
