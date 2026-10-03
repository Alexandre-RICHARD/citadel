import type { UpdateBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/updateBoss/updateBossEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { locateById } from "../../../../common/api/cache/locateById";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { getCachedBosses } from "../cache/getCachedBosses";
import { updateCachedBossSummary } from "../cache/updateCachedBossSummary";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterFieldLabels } from "../gameDeathCounterFieldLabels";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Ids = { gameId: number; bossId: number };
type Variables = { name: string };
type Rollback = { previousName: string } | null;

export function useUpdateBoss(ids: Ids) {
	const { gameId, bossId } = ids;

	return useOptimisticMutation<UpdateBoss, Variables, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("updateBoss", bossId),
		actionLabel: "renommer le boss",
		// L'endpoint sait aussi changer le boss de jeu : on renvoie son jeu actuel
		buildRequest: ({ name }) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`,
			method: HttpMethodEnum.PUT,
			protected: false,
			pathParams: { id: bossId },
			body: { name, gameId },
		}),
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.game(gameId)],
		applyOptimistic: (queryClient, { name }) => {
			const located = locateById(getCachedBosses(queryClient, gameId), bossId);
			updateCachedBossSummary(queryClient, ids, (boss) => ({ ...boss, name }));
			return located && { previousName: located.item.name };
		},
		revertOptimistic: (queryClient, _variables, rollback) => {
			if (rollback)
				updateCachedBossSummary(queryClient, ids, (boss) => ({
					...boss,
					name: rollback.previousName,
				}));
		},
		applyServerResponse: (queryClient, updatedBoss) =>
			updateCachedBossSummary(queryClient, ids, () => updatedBoss),
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneResource(queryClient, error, ids),
		errorReasons: gameDeathCounterErrorReasons,
		fieldLabels: gameDeathCounterFieldLabels,
	});
}
