import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";

// Une ligne de la liste à importer : l'identifiant TMDB et le type, rien d'autre (§7.2)
export type MediaImportEntryDto = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
};
