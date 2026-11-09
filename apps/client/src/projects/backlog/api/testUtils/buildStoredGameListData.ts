import type { StoredGameSummaryDto } from "@citadel/specs/src/projects/backlog/dto/game/storedGameSummaryDto.type";

import type { StoredGameListData } from "../cache/storedGameListData.type";

function buildStoredGameSummaryDto(id: number): StoredGameSummaryDto {
	return {
		id,
		name: `Game ${id}`,
		frenchName: null,
		releaseYear: 2020,
		coverImageId: null,
		platformNames: ["PS5"],
	};
}

// Une liste en cache : une page par liste d'ids (null : page vide), toutes avec le même total
export function buildStoredGameListData(
	pages: (number[] | null)[],
	totalCount: number,
): StoredGameListData {
	return {
		pages: pages.map((ids) =>
			ids === null
				? null
				: { games: ids.map(buildStoredGameSummaryDto), totalCount },
		),
		pageParams: pages.map((_page, index) => index + 1),
	};
}
