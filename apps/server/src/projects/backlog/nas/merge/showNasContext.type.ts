import type { SurveyIndex } from "./surveyIndex.type.ts";

// Ce qu'il faut pour relier les épisodes d'une série au relevé
export type ShowNasContext = {
	index: SurveyIndex;
	verifiedKeys: ReadonlySet<string>;
	showTmdbId: number;
	originalLanguage: string | null;
	today: string;
};
