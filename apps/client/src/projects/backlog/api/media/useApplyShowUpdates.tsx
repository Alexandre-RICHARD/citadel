import type { ShowUpdateListDto } from "@citadel/specs/src/projects/backlog/dto/showUpdate/showUpdateListDto.type";
import type { ApplyShowUpdatesBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/applyShowUpdates/applyShowUpdatesBodyDto.type";
import type { ApplyShowUpdates } from "@citadel/specs/src/projects/backlog/endpoint/showUpdates/applyShowUpdates/applyShowUpdatesEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";

// Les séries retirées du récapitulatif, pour les y remettre si le serveur refuse
type Rollback = ShowUpdateListDto;

/**
 * « Valider » le récapitulatif des nouveautés : les nouvelles saisons et les nouveaux épisodes des séries choisies entrent
 * en base. Elles quittent le récapitulatif tout de suite ; leurs lignes et leurs saisons se relisent à la réponse
 */
export function useApplyShowUpdates() {
	return useOptimisticMutation<
		ApplyShowUpdates,
		ApplyShowUpdatesBodyDto,
		Rollback
	>({
		mutationKey: backlogQueryKeys.mutation("applyShowUpdates"),
		actionLabel: "enregistrer les nouveautés des séries",
		buildRequest: (body) => ({
			url: `${ApiPrefixEnum.BACKLOG}/show-updates`,
			method: HttpMethodEnum.POST,
			protected: true,
			body,
		}),
		getAffectedQueryKeys: () => [
			backlogQueryKeys.userMediaLists(),
			backlogQueryKeys.showSeasonsOfAll(),
		],
		applyOptimistic: (queryClient, { tmdbIds }) => {
			const updates =
				queryClient.getQueryData<ShowUpdateListDto | null>(
					backlogQueryKeys.showUpdates(),
				) ?? [];
			queryClient.setQueryData<ShowUpdateListDto>(
				backlogQueryKeys.showUpdates(),
				updates.filter(({ tmdbId }) => !tmdbIds.includes(tmdbId)),
			);
			return updates.filter(({ tmdbId }) => tmdbIds.includes(tmdbId));
		},
		revertOptimistic: (queryClient, _body, removed) =>
			queryClient.setQueryData<ShowUpdateListDto | null>(
				backlogQueryKeys.showUpdates(),
				(updates) => [...(updates ?? []), ...removed],
			),
		errorReasons: backlogErrorReasons,
		fieldLabels: backlogFieldLabels,
	});
}
