import type { IgdbSearchResultListDto } from "@citadel/specs/src/projects/backlog/dto/igdb/igdbSearchResultListDto.type.ts";

import type { SearchResultBean } from "../../../bean/searchResultBean.type.ts";

export function fromSearchResultBeanListToIgdbSearchResultListDto(
	results: SearchResultBean[],
): IgdbSearchResultListDto {
	return {
		results: results.map((result) => ({
			igdbId: result.igdbId,
			name: result.name,
			frenchName: result.frenchName,
			matchedName: result.matchedName,
			releaseYear: result.releaseYear,
			coverImageId: result.coverImageId,
			platformNames: result.platformNames,
			storedGameId: result.storedGameId,
			isInBacklog: result.isInBacklog,
		})),
	};
}
