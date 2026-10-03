import type { GetOneBoss } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/bosses/getOneBoss/getOneBossEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useSuspenseQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";
import type { BossFm } from "../model/bossFm.type";
import { fromBossDtoToBossFm } from "../model/fromBossDtoToBossFm";

// Détail d'un boss, chargé à son dépliage
export function useBoss(bossId: number): BossFm {
	return useSuspenseQuery({
		queryKey: gameDeathCounterQueryKeys.boss(bossId),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetOneBoss>(
					{
						url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:id`,
						method: HttpMethodEnum.GET,
						protected: false,
						pathParams: { id: bossId },
					},
					{ signal },
				)
			).data,
		select: fromBossDtoToBossFm,
	}).data;
}
