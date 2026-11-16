import type { GetNasStatus } from "@citadel/specs/src/projects/backlog/endpoint/nas/getNasStatus/getNasStatusEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";

// Le mode connecté est-il là ? Lu une fois au chargement du backlog ; le serveur public répond toujours non
export function nasStatusQueryOptions() {
	return queryOptions({
		queryKey: backlogQueryKeys.nasStatus(),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetNasStatus>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/nas-status`,
						method: HttpMethodEnum.GET,
						protected: true,
					},
					{ signal },
				)
			).data,
		// Le front ne relit rien tout seul : un onglet oublié ne tient pas l'instance locale éveillée (§3)
		staleTime: Infinity,
	});
}
