import type { DeathDto } from "@citadel/specs/src/projects/gameDeathCounter/dto/death/deathDto.type";
import type { AddDeath } from "@citadel/specs/src/projects/gameDeathCounter/endpoint/deaths/addDeath/addDeathEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { removeById } from "../../../../common/api/cache/removeById";
import { replaceById } from "../../../../common/api/cache/replaceById";
import { createTemporaryId } from "../../../../common/api/mutation/createTemporaryId";
import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { forgetGoneResource } from "../cache/forgetGoneResource";
import { shiftBossDeathCount } from "../cache/shiftBossDeathCount";
import { updateCachedBoss } from "../cache/updateCachedBoss";
import { gameDeathCounterErrorReasons } from "../gameDeathCounterErrorReasons";
import { gameDeathCounterQueryKeys } from "../gameDeathCounterQueryKeys";

type Ids = { gameId: number; bossId: number };
type Rollback = { temporaryId: number };

// Le serveur date la mort lui-même : la requête n'a pas de corps
export function useAddDeath(ids: Ids) {
	const { gameId, bossId } = ids;

	return useOptimisticMutation<AddDeath, void, Rollback>({
		mutationKey: gameDeathCounterQueryKeys.mutation("addDeath", bossId),
		actionLabel: "ajouter la mort",
		buildRequest: () => ({
			url: `${ApiPrefixEnum.GAME_DEATH_COUNTER}/bosses/:bossId/deaths`,
			method: HttpMethodEnum.POST,
			protected: false,
			pathParams: { bossId },
		}),
		// Le serveur recalcule aussi les dates de première et dernière tentative du boss
		getAffectedQueryKeys: () => [
			gameDeathCounterQueryKeys.boss(bossId),
			gameDeathCounterQueryKeys.game(gameId),
			gameDeathCounterQueryKeys.gameList(),
		],
		applyOptimistic: (queryClient) => {
			const temporaryDeath: DeathDto = {
				id: createTemporaryId(),
				date: new Date().toISOString(),
				comment: null,
			};
			updateCachedBoss(queryClient, bossId, (boss) => ({
				...boss,
				deaths: [...boss.deaths, temporaryDeath],
			}));
			shiftBossDeathCount(queryClient, ids, 1);
			return { temporaryId: temporaryDeath.id };
		},
		revertOptimistic: (queryClient, _variables, { temporaryId }) => {
			updateCachedBoss(queryClient, bossId, (boss) => ({
				...boss,
				deaths: removeById(boss.deaths, temporaryId),
			}));
			shiftBossDeathCount(queryClient, ids, -1);
		},
		applyServerResponse: (
			queryClient,
			addedDeath,
			_variables,
			{ temporaryId },
		) =>
			updateCachedBoss(queryClient, bossId, (boss) => ({
				...boss,
				deaths: replaceById(boss.deaths, temporaryId, () => addedDeath),
			})),
		removeGoneResource: (queryClient, _variables, error) =>
			forgetGoneResource(queryClient, error, ids),
		errorReasons: gameDeathCounterErrorReasons,
	});
}
