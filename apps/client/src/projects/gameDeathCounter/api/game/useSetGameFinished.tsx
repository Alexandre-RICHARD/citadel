import type { SetGameFinishedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedBodyDto.type";
import type { SetGameFinished } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/setGameFinished/setGameFinishedEndpoint.interface";
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

type Rollback = { previousEndedAt: string | null } | null;

export function useSetGameFinished(gameId: number) {
	return useOptimisticMutation<
		SetGameFinished,
		SetGameFinishedBodyDto,
		Rollback
	>({
		mutationKey: gameDeathCounterQueryKeys.mutation("setGameFinished", gameId),
		actionLabel: "changer le statut du jeu",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:id/finished`,
			method: HttpMethodEnum.PATCH,
			protected: false,
			pathParams: { id: gameId },
			body,
		}),
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.gameList()],
		// L'heure de fin définitive vient du serveur ; d'ici là, l'heure locale
		applyOptimistic: (queryClient, { finished }) => {
			const located = locateById(getCachedGames(queryClient), gameId);
			updateCachedGameSummary(queryClient, gameId, (game) => ({
				...game,
				endedAt: finished ? new Date().toISOString() : null,
			}));
			return located && { previousEndedAt: located.item.endedAt };
		},
		revertOptimistic: (queryClient, _body, rollback) => {
			if (rollback)
				updateCachedGameSummary(queryClient, gameId, (game) => ({
					...game,
					endedAt: rollback.previousEndedAt,
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
