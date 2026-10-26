import type { IgdbSearchResultDto } from "@citadel/specs/src/projects/backlog/dto/igdb/igdbSearchResultDto.type";

import type { GameHitFm } from "./gameHitFm.type";

export function fromIgdbSearchResultDtoToGameHitFm(
	result: IgdbSearchResultDto,
): GameHitFm {
	return {
		id: result.igdbId,
		name: result.name,
		frenchName: result.frenchName,
		matchedName: result.matchedName,
		releaseYear: result.releaseYear,
		coverImageId: result.coverImageId,
		platformNames: result.platformNames,
		storedGameId: result.storedGameId,
		isInBacklog: result.isInBacklog,
	};
}
