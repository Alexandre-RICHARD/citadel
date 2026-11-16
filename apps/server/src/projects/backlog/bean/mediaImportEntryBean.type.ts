import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Une ligne de la liste à importer
export type MediaImportEntryBean = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
};
