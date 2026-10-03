import type { GameSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/game/gameSummaryDto.type";
import type { CreateGameBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameBodyDto.type";
import type { CreateGame } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/games/createGame/createGameEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { removeById } from "../../../../common/api/cache/removeById";
import { replaceById } from "../../../../common/api/cache/replaceById";
import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { updateCachedGames } from "../cache/updateCachedGames";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterFieldLabels } from "../gameDeathCounterFieldLabels";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Rollback = { temporaryId: number };

export function useCreateGame() {
	return useOptimisticMutation<CreateGame, CreateGameBodyDto, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("createGame"),
		actionLabel: "créer le jeu",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games`,
			method: HttpMethodEnum.POST,
			protected: false,
			body,
		}),
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.gameList()],
		applyOptimistic: (queryClient, { name }) => {
			const temporaryGame: GameSummaryDto = {
				id: createTemporaryId(),
				name,
				startedAt: new Date().toISOString(),
				endedAt: null,
				totalDeath: 0,
			};
			updateCachedGames(queryClient, (games) => [...games, temporaryGame]);
			return { temporaryId: temporaryGame.id };
		},
		revertOptimistic: (queryClient, _body, { temporaryId }) =>
			updateCachedGames(queryClient, (games) => removeById(games, temporaryId)),
		applyServerResponse: (queryClient, createdGame, _body, { temporaryId }) =>
			updateCachedGames(queryClient, (games) =>
				replaceById(games, temporaryId, () => createdGame),
			),
		errorReasons: gameDeathCounterErrorReasons,
		fieldLabels: gameDeathCounterFieldLabels,
	});
}
