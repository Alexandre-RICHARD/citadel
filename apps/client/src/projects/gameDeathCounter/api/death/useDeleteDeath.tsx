import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type";
import type { DeleteDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/deleteDeath/deleteDeathEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { insertAt } from "../../../../common/api/cache/insertAt";
import { locateById } from "../../../../common/api/cache/locateById";
import type { LocatedItem } from "../../../../common/api/cache/locatedItem.type";
import { removeById } from "../../../../common/api/cache/removeById";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { getCachedDeaths } from "../cache/getCachedDeaths";
import { shiftBossDeathCount } from "../cache/shiftBossDeathCount";
import { updateCachedBoss } from "../cache/updateCachedBoss";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Ids = { gameId: number; bossId: number; deathId: number };
type Rollback = LocatedItem<DeathDto> | null;

export function useDeleteDeath(ids: Ids) {
	const { gameId, bossId, deathId } = ids;

	return useOptimisticMutation<DeleteDeath, void, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("deleteDeath", deathId),
		actionLabel: "supprimer la mort",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/:id`,
			method: HttpMethodEnum.DELETE,
			protected: false,
			pathParams: { id: deathId },
		}),
		getAffectedQueryKeys: () => [
			gameDeathCounterQueryKeys.boss(bossId),
			gameDeathCounterQueryKeys.game(gameId),
			gameDeathCounterQueryKeys.gameList(),
		],
		applyOptimistic: (queryClient) => {
			const located = locateById(getCachedDeaths(queryClient, bossId), deathId);
			updateCachedBoss(queryClient, bossId, (boss) => ({
				...boss,
				deaths: removeById(boss.deaths, deathId),
			}));
			if (located) shiftBossDeathCount(queryClient, ids, -1);
			return located;
		},
		revertOptimistic: (queryClient, _variables, located) => {
			if (!located) return;
			updateCachedBoss(queryClient, bossId, (boss) => ({
				...boss,
				deaths: insertAt(boss.deaths, located.index, located.item),
			}));
			shiftBossDeathCount(queryClient, ids, 1);
		},
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneResource(queryClient, error, ids),
		errorReasons: gameDeathCounterErrorReasons,
	});
}
