import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";

// Un média reconnu par TMDB, qui entrera au backlog sur « Valider »
export type MediaImportRecognizedDto = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	date: string | null;
	// L'affiche que prendra sa miniature : la première de TMDB
	posterPath: string | null;
};
