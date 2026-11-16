import type { MediaTypeEnum } from "../../enum/mediaType.enum.ts";
import type { SagaDto } from "../saga/sagaDto.type.ts";

/**
 * Un média du backlog du compte, tel que sa ligne l'affiche. Pour une série, `isWatched`, les compteurs d'épisodes et
 * la durée sont calculés sur ses saisons principales et ses épisodes déjà diffusés (§5) ; pour un film, les compteurs
 * valent 0. `releaseDate` : la sortie d'un film, la première diffusion d'une série
 */
export type UserMediaDto = {
	id: number;
	mediaType: MediaTypeEnum;
	tmdbId: number;
	title: string;
	originalTitle: string;
	originalLanguage: string | null;
	releaseDate: string | null;
	runtimeMinutes: number | null;
	imagePath: string | null;
	saga: SagaDto | null;
	sagaNumber: number | null;
	isWatched: boolean;
	watchedEpisodeCount: number;
	airedEpisodeCount: number;
	isUpNext: boolean;
	isInProgress: boolean;
	comment: string | null;
	createdAt: string;
	updatedAt: string;
};
