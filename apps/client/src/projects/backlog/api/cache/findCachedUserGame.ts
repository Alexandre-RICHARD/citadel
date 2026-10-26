import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";
import type { UserGameListData } from "./userGameListData.type";

// La ligne d'un jeu dans la première vue du tableau qui l'a chargée ; undefined sinon
export function findCachedUserGame(
	queryClient: QueryClient,
	gameId: number,
): UserGameDto | undefined {
	for (const [, data] of queryClient.getQueriesData<UserGameListData>({
		queryKey: backlogQueryKeys.userGames(),
	}))
		for (const page of data?.pages ?? []) {
			const userGame = page?.userGames.find(({ game }) => game.id === gameId);
			if (userGame !== undefined) return userGame;
		}
	return undefined;
}
