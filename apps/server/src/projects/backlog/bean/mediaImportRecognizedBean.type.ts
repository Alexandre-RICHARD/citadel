import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Un média reconnu, qui entrera au backlog sur « Valider » avec sa première affiche pour miniature
export type MediaImportRecognizedBean = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	date: string | null;
	posterPath: string | null;
};
