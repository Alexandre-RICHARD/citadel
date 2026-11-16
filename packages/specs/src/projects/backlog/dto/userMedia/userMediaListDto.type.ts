import type { UserMediaDto } from "./userMediaDto.type.ts";

export type UserMediaListDto = {
	// Une page, triée et filtrée
	userMedia: UserMediaDto[];
	// Médias qui correspondent aux filtres, toutes pages confondues
	matchedCount: number;
	// Tout le backlog des films et séries du compte, pour le résumé en haut du tableau
	movieCount: number;
	showCount: number;
	// Les langues originales du backlog (codes ISO 639-1), proposées au filtre de leur colonne
	originalLanguages: string[];
};
