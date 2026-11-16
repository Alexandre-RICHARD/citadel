import type { ShowSeasonDto } from "./showSeasonDto.type.ts";

// Les saisons d'une série, par numéro, les épisodes spéciaux à la fin ; vide pour un film
export type ShowSeasonListDto = {
	seasons: ShowSeasonDto[];
};
