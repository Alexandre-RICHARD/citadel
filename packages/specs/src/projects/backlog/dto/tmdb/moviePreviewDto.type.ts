import type { ProposedSagaDto } from "./proposedSagaDto.type.ts";

// La fiche d'un film, en lecture seule, avant de l'ajouter ; `userMediaId` : déjà dans le backlog du compte
export type MoviePreviewDto = {
	tmdbId: number;
	title: string;
	originalTitle: string;
	originalLanguage: string | null;
	releaseDate: string | null;
	runtimeMinutes: number | null;
	posterPath: string | null;
	collection: { id: number; name: string } | null;
	proposedSaga: ProposedSagaDto | null;
	userMediaId: number | null;
};
