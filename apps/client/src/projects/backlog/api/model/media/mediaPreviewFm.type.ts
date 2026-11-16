import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

// Une saison dans la fiche d'une série : toutes entrent au backlog, la fiche les montre pour confirmer la série
type PreviewSeasonFm = {
	seasonNumber: number;
	name: string;
	isSpecials: boolean;
	airDate: string | null;
	episodes: { episodeNumber: number; name: string; airDate: string | null }[];
};

/**
 * La fiche d'un film ou d'une série, en lecture seule, avant l'ajout. `proposedSaga` : celle que propose la collection TMDB
 * d'un film (`sagaId` null : une nouvelle saga à son nom) ; `userMediaId` : déjà dans le backlog
 */
export type MediaPreviewFm = {
	mediaType: MediaTypeEnum;
	tmdbId: number;
	tmdbUrl: string;
	title: string;
	originalTitle: string | null;
	originalLanguage: string | null;
	releaseDate: string | null;
	runtimeMinutes: number | null;
	posterPath: string | null;
	collectionName: string | null;
	proposedSaga: { sagaId: number | null; name: string } | null;
	// Série : en cours sur TMDB (de nouveaux épisodes viendront)
	isOngoing: boolean;
	seasons: PreviewSeasonFm[];
	userMediaId: number | null;
};
