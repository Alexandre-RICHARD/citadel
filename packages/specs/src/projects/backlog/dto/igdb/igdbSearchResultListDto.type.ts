import type { IgdbSearchResultDto } from "./igdbSearchResultDto.type.ts";

export type IgdbSearchResultListDto = {
	// Dans l'ordre de pertinence d'IGDB
	results: IgdbSearchResultDto[];
};
