import type { GetFlow } from "@citadel/specs/src/projects/auth/endpoint/flow/getFlow/getFlowEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";
import type { ReceivedFlowStatus } from "../model/receivedFlowStatus.type";

// Toujours relu à l'arrivée sur une page : le lien a pu être ouvert dans un autre onglet entre-temps
export const flowQueryOptions = queryOptions({
	queryKey: authQueryKeys.flow(),
	queryFn: async ({ signal }): Promise<ReceivedFlowStatus> => {
		const { data } = await fetchHandler<GetFlow>(
			{
				url: `${ApiPrefixEnum.AUTH}/flow`,
				method: HttpMethodEnum.GET,
				protected: false,
			},
			{ signal },
		);
		return { status: data, receivedAt: Date.now() };
	},
	staleTime: 0,
});
