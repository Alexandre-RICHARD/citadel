import type { UserGameDto } from "@citadel/specs/src/projects/backlog/dto/userGame/userGameDto.type";
import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";
import type { UserGameListData } from "./userGameListData.type";

// La ligne d'un jeu, dans toutes les vues du tableau en cache ; sans effet là où elle n'est pas chargée
export function updateCachedUserGame(
	queryClient: QueryClient,
	gameId: number,
	update: (userGame: UserGameDto) => UserGameDto,
): void {
	queryClient.setQueriesData<UserGameListData>(
		{ queryKey: backlogQueryKeys.userGames() },
		(data) =>
			data === undefined
				? undefined
				: {
						...data,
						pages: data.pages.map((page) =>
							page === null
								? null
								: {
										...page,
										userGames: page.userGames.map((userGame) =>
											userGame.game.id === gameId ? update(userGame) : userGame,
										),
									},
						),
					},
	);
}
