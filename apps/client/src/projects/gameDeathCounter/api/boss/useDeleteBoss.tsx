import type { BossSummaryDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/boss/bossSummaryDto.type";
import type { DeleteBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/deleteBoss/deleteBossEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { insertAt } from "../../../../common/api/cache/insertAt";
import { locateById } from "../../../../common/api/cache/locateById";
import type { LocatedItem } from "../../../../common/api/cache/locatedItem.type";
import { removeById } from "../../../../common/api/cache/removeById";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetBoss } from "../cache/forgetBoss";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { getCachedBosses } from "../cache/getCachedBosses";
import { shiftGameDeathCount } from "../cache/shiftGameDeathCount";
import { updateCachedGame } from "../cache/updateCachedGame";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Ids = { gameId: number; bossId: number };
type Rollback = LocatedItem<BossSummaryDto> | null;

export function useDeleteBoss(ids: Ids) {
	const { gameId, bossId } = ids;

	return useOptimisticMutation<DeleteBoss, void, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("deleteBoss", bossId),
		actionLabel: "supprimer le boss",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`,
			method: HttpMethodEnum.DELETE,
			protected: false,
			pathParams: { id: bossId },
		}),
		getAffectedQueryKeys: () => [
			gameDeathCounterQueryKeys.game(gameId),
			gameDeathCounterQueryKeys.gameList(),
		],
		// Ses morts partent avec lui : le total du jeu baisse d'autant
		applyOptimistic: (queryClient) => {
			const located = locateById(getCachedBosses(queryClient, gameId), bossId);
			updateCachedGame(queryClient, gameId, (game) => ({
				...game,
				bosses: removeById(game.bosses, bossId),
			}));
			if (located)
				shiftGameDeathCount(queryClient, gameId, -located.item.totalDeath);
			return located;
		},
		revertOptimistic: (queryClient, _variables, located) => {
			if (!located) return;
			updateCachedGame(queryClient, gameId, (game) => ({
				...game,
				bosses: insertAt(game.bosses, located.index, located.item),
			}));
			shiftGameDeathCount(queryClient, gameId, located.item.totalDeath);
		},
		applyServerResponse: (queryClient) => forgetBoss(queryClient, ids),
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneResource(queryClient, error, ids),
		errorReasons: gameDeathCounterErrorReasons,
	});
}
