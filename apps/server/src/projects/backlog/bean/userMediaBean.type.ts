import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum.ts";

import type { SagaBean } from "./sagaBean.type.ts";

/**
 * Un média du backlog du compte, tel que sa ligne l'affiche. Pour une série, « vu », les compteurs et la durée sont
 * calculés sur ses épisodes (summarizeShowProgress) ; pour un film, les compteurs valent 0
 */
export type UserMediaBean = {
	id: number;
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	originalTitle: string;
	originalLanguage: string | null;
	releaseDate: string | null;
	runtimeMinutes: number | null;
	imagePath: string | null;
	saga: SagaBean | null;
	sagaNumber: number | null;
	sagaNumberLabel: string | null;
	isWatched: boolean;
	watchedEpisodeCount: number;
	airedEpisodeCount: number;
	isUpNext: boolean;
	isInProgress: boolean;
	comment: string | null;
	createdAt: Date;
	updatedAt: Date;
};
