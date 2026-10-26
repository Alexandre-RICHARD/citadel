import type { UserGameDto } from "./userGameDto.type.ts";

export type UserGameListDto = {
	// Une page, triée et filtrée
	userGames: UserGameDto[];
	// Jeux qui correspondent aux filtres, toutes pages confondues
	matchedCount: number;
};
