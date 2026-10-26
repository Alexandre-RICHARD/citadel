import type { StoredGameSummaryDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameSummaryDto.type";

import type { GameHitFm } from "./gameHitFm.type";

// Un jeu de « Ma base » : en base, hors backlog, trouvé par son propre nom
export function fromStoredGameSummaryDtoToGameHitFm(
	game: StoredGameSummaryDto,
): GameHitFm {
	return {
		id: game.id,
		name: game.name,
		frenchName: game.frenchName,
		matchedName: null,
		releaseYear: game.releaseYear,
		coverImageId: game.coverImageId,
		platformNames: game.platformNames,
		storedGameId: game.id,
		isInBacklog: false,
	};
}
