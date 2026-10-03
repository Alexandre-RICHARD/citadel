import type { SetBossDefeatedBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedBodyDto.type";
import type { SetBossDefeated } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/setBossDefeated/setBossDefeatedEndpoint.interface";
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
type Rollback = { previousDefeatedAt: string | null } | null;

export function useSetBossDefeated(ids: Ids) {
	const { gameId, bossId } = ids;

	return useOptimisticMutation<
		SetBossDefeated,
		SetBossDefeatedBodyDto,
		Rollback
	>({
		mutationKey: gameDeathCounterQueryKeys.mutation("setBossDefeated", bossId),
		actionLabel: "changer le statut du boss",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id/defeated`,
			method: HttpMethodEnum.PATCH,
			protected: false,
			pathParams: { id: bossId },
			body,
		}),
		// Le serveur recalcule aussi les dates de première et dernière tentative
		getAffectedQueryKeys: () => [gameDeathCounterQueryKeys.game(gameId)],
		applyOptimistic: (queryClient, { defeated }) => {
			const located = locateById(getCachedBosses(queryClient, gameId), bossId);
			updateCachedBossSummary(queryClient, ids, (boss) => ({
				...boss,
				defeatedAt: defeated ? new Date().toISOString() : null,
			}));
			return located && { previousDefeatedAt: located.item.defeatedAt };
		},
		revertOptimistic: (queryClient, _body, rollback) => {
			if (rollback)
				updateCachedBossSummary(queryClient, ids, (boss) => ({
					...boss,
					defeatedAt: rollback.previousDefeatedAt,
				}));
		},
		applyServerResponse: (queryClient, updatedBoss) =>
			updateCachedBossSummary(queryClient, ids, () => updatedBoss),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneResource(queryClient, error, ids),
		errorReasons: gameDeathCounterErrorReasons,
		fieldLabels: gameDeathCounterFieldLabels,
	});
}
