import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// Le fichier de l'import, lu dans le navigateur : ses lignes reconnues, et les numéros de celles qui ne le sont pas
export type MediaImportCsv = {
	entries: { mediaType: MediaTypeEnum; tmdbId: number }[];
	invalidLines: { lineNumber: number; text: string }[];
};
