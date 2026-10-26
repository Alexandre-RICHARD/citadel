import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";

import type { UserGameListData } from "../cache/userGameListData.type";

// Une vue du tableau en cache : une page par liste de lignes (null : page vide), toutes avec le même total
export function buildUserGameListData(
	pages: (UserGameDto[] | null)[],
	matchedCount: number,
): UserGameListData {
	return {
		pages: pages.map((userGames) =>
			userGames === null ? null : { userGames, matchedCount },
		),
		pageParams: pages.map((_page, index) => index + 1),
	};
}
