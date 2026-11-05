import { insertAt } from "@citadel/common/src/universal/array/insertAt";
import { locateById } from "@citadel/common/src/universal/array/locateById";
import type { LocatedItem } from "@citadel/common/src/universal/array/locatedItem.type";
import { removeById } from "@citadel/common/src/universal/array/removeById";
import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import type { DeleteGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/deleteGame/deleteGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGame } from "../cache/forgetGame";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { getCachedGames } from "../cache/getCachedGames";
import { updateCachedGames } from "../cache/updateCachedGames";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Rollback = LocatedItem<GameSummaryDto> | null;

export function useDeleteGame(gameId: number) {
	return useOptimisticMutation<DeleteGame, void, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("deleteGame", gameId),
		actionLabel: "supprimer le jeu",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id`,
			method: HttpMethodEnum.DELETE,
			protected: true,
			pathParams: { id: gameId },
		}),
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.gameList()],
		applyOptimistic: (queryClient) => {
			const located = locateById(getCachedGames(queryClient), gameId);
			updateCachedGames(queryClient, (games) => removeById(games, gameId));
			return located;
		},
		revertOptimistic: (queryClient, _variables, located) => {
			if (located)
				updateCachedGames(queryClient, (games) =>
					insertAt(games, located.index, located.item),
				);
		},
		// Le détail du jeu et celui de ses boss n'ont plus lieu d'être
		applyServerResponse: (queryClient) => forgetGame(queryClient, gameId),
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneResource(queryClient, error, { gameId }),
		errorReasons: gameDeathCounterErrorReasons,
	});
}
