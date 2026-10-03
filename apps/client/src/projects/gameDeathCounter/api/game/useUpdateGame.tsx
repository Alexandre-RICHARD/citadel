import type { UpdateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGameBodyDto.type";
import type { UpdateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/updateGame/updateGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { locateById } from "../../../../common/api/cache/locateById";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { getCachedGames } from "../cache/getCachedGames";
import { updateCachedGameSummary } from "../cache/updateCachedGameSummary";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterFieldLabels } from "../gameDeathCounterFieldLabels";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

// null : jeu absent de la liste, rien à défaire
type Rollback = { previousName: string } | null;

export function useUpdateGame(gameId: number) {
	return useOptimisticMutation<UpdateGame, UpdateGameBodyDto, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("updateGame", gameId),
		actionLabel: "renommer le jeu",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id`,
			method: HttpMethodEnum.PUT,
			protected: false,
			pathParams: { id: gameId },
			body,
		}),
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.gameList()],
		applyOptimistic: (queryClient, { name }) => {
			const located = locateById(getCachedGames(queryClient), gameId);
			updateCachedGameSummary(queryClient, gameId, (game) => ({
				...game,
				name,
			}));
			return located && { previousName: located.item.name };
		},
		revertOptimistic: (queryClient, _body, rollback) => {
			if (rollback)
				updateCachedGameSummary(queryClient, gameId, (game) => ({
					...game,
					name: rollback.previousName,
				}));
		},
		applyServerResponse: (queryClient, updatedGame) =>
			updateCachedGameSummary(queryClient, gameId, () => updatedGame),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneResource(queryClient, error, { gameId }),
		errorReasons: gameDeathCounterErrorReasons,
		fieldLabels: gameDeathCounterFieldLabels,
	});
}
