import type { StoredGameSummaryDto } from "./storedGameSummaryDto.type.ts";

export type StoredGameListDto = {
	// Une page, triée par nom affiché
	games: StoredGameSummaryDto[];
	// Tous les jeux qui correspondent à la saisie, toutes pages confondues
	totalCount: number;
};
