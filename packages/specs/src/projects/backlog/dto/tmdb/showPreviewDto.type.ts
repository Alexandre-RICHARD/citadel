import type { ShowPreviewSeasonDto } from "./showPreviewSeasonDto.type.ts";

/**
 * La fiche d'une série, en lecture seule, avant de l'ajouter : toutes ses saisons et tous ses épisodes, qui entreront
 * tous au backlog. `userMediaId` : déjà dans le backlog du compte
 */
export type ShowPreviewDto = {
	tmdbId: number;
	title: string;
	originalTitle: string;
	originalLanguage: string | null;
	firstAirDate: string | null;
	posterPath: string | null;
	isOngoing: boolean;
	seasons: ShowPreviewSeasonDto[];
	userMediaId: number | null;
};
