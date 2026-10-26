import type { StoredGameListDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameListDto.type.ts";

import type { StoredGamePageBean } from "../../../bean/storedGamePageBean.type.ts";

export function fromStoredGamePageBeanToStoredGameListDto(
	page: StoredGamePageBean,
): StoredGameListDto {
	return {
		games: page.games.map((game) => ({
			id: game.id,
			name: game.name,
			frenchName: game.frenchName,
			releaseYear: game.releaseYear,
			coverImageId: game.coverImageId,
			platformNames: game.platformNames,
		})),
		totalCount: page.totalCount,
	};
}
