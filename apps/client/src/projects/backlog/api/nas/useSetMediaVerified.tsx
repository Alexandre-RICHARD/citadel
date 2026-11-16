import type { SetMediaVerifiedBodyDto } from "@citadel/specs/src/projects/backlog/endpoint/nas/setMediaVerified/setMediaVerifiedBodyDto.type";
import type { SetMediaVerified } from "@citadel/specs/src/projects/backlog/endpoint/nas/setMediaVerified/setMediaVerifiedEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";

import { useOptimisticMutation } from "../../../../common/api/mutation/useOptimisticMutation";
import { backlogErrorReasons } from "../backlogErrorReasons";
import { backlogFieldLabels } from "../backlogFieldLabels";
import { backlogQueryKeys } from "../backlogQueryKeys";

/**
 * Cases « Vérifié » d'un film ou d'épisodes d'une série : la seule écriture du backlog sur le NAS. Sans mise à jour
 * optimiste (l'empreinte du fichier vient du serveur) : la ligne et les saisons se relisent à la réponse
 */
export function useSetMediaVerified(userMediaId: number) {
	return useOptimisticMutation<SetMediaVerified, SetMediaVerifiedBodyDto, null>(
		{
			mutationKey: backlogQueryKeys.mutation("setMediaVerified", userMediaId),
			scope: `userMedia-${userMediaId}`,
			actionLabel: "cocher « Vérifié »",
			buildRequest: (body) => ({
				url: `${ApiPrefixEnum.BACKLOG}/nas/user-media/:userMediaId/verified`,
				method: HttpMethodEnum.PUT,
				protected: true,
				pathParams: { userMediaId },
				body,
			}),
			getAffectedQueryKeys: () => [
				backlogQueryKeys.userMediaLists(),
				backlogQueryKeys.showSeasons(userMediaId),
			],
			applyOptimistic: () => null,
			revertOptimistic: () => undefined,
			errorReasons: backlogErrorReasons,
			fieldLabels: backlogFieldLabels,
		},
	);
}
