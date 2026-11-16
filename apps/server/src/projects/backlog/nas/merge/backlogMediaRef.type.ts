import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

// Ce qu'il faut d'un média du backlog pour le relier au relevé : son identifiant, ses titres (normalisés) et son année
export type BacklogMediaRef = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	normalizedTitles: string[];
	year: number | null;
};
