import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type";
import type { UpdateDeathBodyDto } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathBodyDto.type";
import type { UpdateDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/updateDeath/updateDeathEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { locateById } from "../../../../common/api/cache/locateById";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { getCachedDeaths } from "../cache/getCachedDeaths";
import { updateCachedDeath } from "../cache/updateCachedDeath";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterFieldLabels } from "../gameDeathCounterFieldLabels";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Ids = { gameId: number; bossId: number; deathId: number };
type Rollback = Pick<DeathDto, "date" | "comment"> | null;

// Seuls les champs modifiés partent : changer le commentaire ne réécrit pas la date
export function useUpdateDeath(ids: Ids) {
	const { gameId, bossId, deathId } = ids;

	return useOptimisticMutation<UpdateDeath, UpdateDeathBodyDto, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("updateDeath", deathId),
		actionLabel: "modifier la mort",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/deaths/:id`,
			method: HttpMethodEnum.PATCH,
			protected: false,
			pathParams: { id: deathId },
			body,
		}),
		// Changer la date peut déplacer la première ou la dernière tentative du boss
		getAffectedQueryKeys: () => [
			gameDeathCounterQueryKeys.boss(bossId),
			gameDeathCounterQueryKeys.game(gameId),
		],
		applyOptimistic: (queryClient, patch) => {
			const located = locateById(getCachedDeaths(queryClient, bossId), deathId);
			updateCachedDeath(queryClient, ids, (death) => ({
				...death,
				...(patch.date !== undefined && { date: patch.date }),
				...(patch.comment !== undefined && { comment: patch.comment }),
			}));
			return (
				located && { date: located.item.date, comment: located.item.comment }
			);
		},
		revertOptimistic: (queryClient, _patch, previous) => {
			if (previous)
				updateCachedDeath(queryClient, ids, (death) => ({
					...death,
					...previous,
				}));
		},
		applyServerResponse: (queryClient, updatedDeath) =>
			updateCachedDeath(queryClient, ids, () => updatedDeath),
		removeGoneResource: (queryClient, _patch, error) =>
			forgetGoneResource(queryClient, error, ids),
		errorReasons: gameDeathCounterErrorReasons,
		fieldLabels: gameDeathCounterFieldLabels,
	});
}
