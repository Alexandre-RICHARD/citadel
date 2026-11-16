import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";

import type { SagaFm } from "./sagaFm.type";

// Ligne d'un film ou d'une série du backlog
export type MediaRowFm = {
	userMediaId: number;
	mediaType: MediaTypeEnum;
	tmdbId: number;
	tmdbUrl: string;
	title: string;
	// null quand il est le même que le titre français
	originalTitle: string | null;
	originalLanguage: string | null;
	// Film : sa sortie ; série : sa première diffusion
	releaseDate: string | null;
	// Série : la somme de ses épisodes principaux
	runtimeMinutes: number | null;
	imagePath: string | null;
	saga: SagaFm | null;
	sagaNumber: number | null;
	sagaNumberLabel: string | null;
	isWatched: boolean;
	// Série : ses épisodes diffusés vus, « 12 / 26 » ; null pour un film
	episodeProgress: { watchedCount: number; airedCount: number } | null;
	isUpNext: boolean;
	isInProgress: boolean;
	comment: string | null;
	// Ajouté de façon optimiste, en attente du serveur : grisé et inerte
	isTemporary: boolean;
};
