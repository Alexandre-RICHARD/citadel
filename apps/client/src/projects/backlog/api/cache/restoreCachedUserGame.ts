import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { insertAt } from "../../../../common/api/cache/insertAt";
import type { RemovedUserGamePosition } from "./removedUserGamePosition.type";
import type { UserGameListData } from "./userGameListData.type";

// Remet une ligne retirée à ses places, opération inverse de removeCachedUserGame
export function restoreCachedUserGame(
	queryClient: QueryClient,
	userGame: UserGameDto,
	positions: RemovedUserGamePosition[],
): void {
	for (const { queryKey, pageIndex, index } of positions)
		queryClient.setQueryData<UserGameListData>(queryKey, (data) =>
			data === undefined
				? undefined
				: {
						...data,
						pages: data.pages.map((page, currentIndex) =>
							page === null
								? null
								: {
										userGames:
											currentIndex === pageIndex
												? insertAt(page.userGames, index, userGame)
												: page.userGames,
										matchedCount: page.matchedCount + 1,
									},
						),
					},
		);
}
