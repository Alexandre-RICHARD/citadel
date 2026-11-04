import type { ListSessions } from "@citadel/specs/src/projects/auth/endpoint/sessions/listSessions/listSessionsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";
import { fromSessionListDtoToSessionFms } from "../model/fromSessionListDtoToSessionFms";

// Les sessions ouvertes du compte : relues à chaque arrivée sur le profil, une autre a pu s'ouvrir ou se fermer
export const sessionsQueryOptions = queryOptions({
	queryKey: authQueryKeys.sessions(),
	queryFn: async ({ signal }) =>
		fromSessionListDtoToSessionFms(
			(
				await fetchHandler<ListSessions>(
					{
						url: `${ApiPrefixEnum.AUTH}/sessions`,
						method: HttpMethodEnum.GET,
						protected: true,
					},
					{ signal },
				)
			).data,
		),
	staleTime: 0,
});
