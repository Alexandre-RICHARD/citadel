import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type";
import type { CreateBossBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossBodyDto.type";
import type { CreateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/createBoss/createBossEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { removeById } from "../../../../common/api/cache/removeById";
import { replaceById } from "../../../../common/api/cache/replaceById";
import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { updateCachedGame } from "../cache/updateCachedGame";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterFieldLabels } from "../gameDeathCounterFieldLabels";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Rollback = { temporaryId: number };

export function useCreateBoss(gameId: number) {
	return useOptimisticMutation<CreateBoss, CreateBossBodyDto, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("createBoss", gameId),
		actionLabel: "ajouter le boss",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/games/:gameId/bosses`,
			method: HttpMethodEnum.POST,
			protected: false,
			pathParams: { gameId },
			body,
		}),
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.game(gameId)],
		applyOptimistic: (queryClient, { name }) => {
			const temporaryBoss: BossSummaryDto = {
				id: createTemporaryId(),
				name,
				firstTry: null,
				lastTry: null,
				defeatedAt: null,
				totalDeath: 0,
			};
			updateCachedGame(queryClient, gameId, (game) => ({
				...game,
				bosses: [...game.bosses, temporaryBoss],
			}));
			return { temporaryId: temporaryBoss.id };
		},
		revertOptimistic: (queryClient, _body, { temporaryId }) =>
			updateCachedGame(queryClient, gameId, (game) => ({
				...game,
				bosses: removeById(game.bosses, temporaryId),
			})),
		applyServerResponse: (queryClient, createdBoss, _body, { temporaryId }) =>
			updateCachedGame(queryClient, gameId, (game) => ({
				...game,
				bosses: replaceById(game.bosses, temporaryId, () => createdBoss),
			})),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneResource(queryClient, error, { gameId }),
		errorReasons: gameDeathCounterErrorReasons,
		fieldLabels: gameDeathCounterFieldLabels,
	});
}
