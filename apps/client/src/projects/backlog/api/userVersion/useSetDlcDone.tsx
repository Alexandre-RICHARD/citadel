import type { SetDlcDoneBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDoneBodyDto.type";
import type { SetDlcDone } from "@citadel/specs/src/projects/backlog/endpoint/userVersions/setDlcDone/setDlcDoneEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";
import { forgetGoneUserGame } from "../cache/forgetGoneUserGame";
import { updateCachedUserGame } from "../cache/updateCachedUserGame";

type Rollback = { wasDone: boolean };

// Coche ou décoche un DLC sur une version jouée
function setDone(
	queryClient: Parameters<typeof updateCachedUserGame>[0],
	ids: { gameId: number; userVersionId: number; dlcId: number },
	isDone: boolean,
): void {
	updateCachedUserGame(queryClient, ids.gameId, (userGame) => ({
		...userGame,
		userVersions: userGame.userVersions.map((userVersion) => {
			if (userVersion.id !== ids.userVersionId) return userVersion;
			const otherIds = userVersion.doneDlcIds.filter((id) => id !== ids.dlcId);
			return {
				...userVersion,
				doneDlcIds: isDone
					? [...otherIds, ids.dlcId].toSorted((first, second) => first - second)
					: otherIds,
			};
		}),
	}));
}

// Case « fait » d'un DLC du popover des DLC (cahier des charges, §9)
export function useSetDlcDone(
	gameId: number,
	userVersionId: number,
	dlcId: number,
) {
	const ids = { gameId, userVersionId, dlcId };

	return useOptimisticMutation<SetDlcDone, SetDlcDoneBodyDto, Rollback>({
		mutationKey: backlogQueryKeys.mutation("setDlcDone", userVersionId, dlcId),
		scope: `userVersion-${userVersionId}`,
		actionLabel: "cocher le DLC",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/user-versions/:id/done-dlcs/:dlcId`,
			method: HttpMethodEnum.PATCH,
			protected: false,
			pathParams: { id: userVersionId, dlcId },
			body,
		}),
		getAffectedQueryKeys: () => [backlogQueryKeys.userGames()],
		applyOptimistic: (queryClient, { isDone }) => {
			setDone(queryClient, ids, isDone);
			return { wasDone: !isDone };
		},
		revertOptimistic: (queryClient, _body, { wasDone }) =>
			setDone(queryClient, ids, wasDone),
		applyServerResponse: (queryClient, userGame) =>
			updateCachedUserGame(queryClient, gameId, () => userGame),
		removeGoneResource: (queryClient, _body, error) =>
			forgetGoneUserGame(queryClient, error, gameId),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}
