import type { GetBacklogOverview } from "@citadel/specs/src/projects/backlog/endpoint/overview/getBacklogOverview/getBacklogOverviewEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";

export const overviewQueryOptions = queryOptions({
	queryKey: backlogQueryKeys.overview(),
	queryFn: async ({ signal }) =>
		(
			await fetchHandler<GetBacklogOverview>(
				{
					url: `${ApiPrefixEnum.BACKLOG}/overview`,
					method: HttpMethodEnum.GET,
					protected: false,
				},
				{ signal },
			)
		).data,
});
