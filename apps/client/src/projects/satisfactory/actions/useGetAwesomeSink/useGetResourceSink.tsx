import type { GetResourceSink } from "@citadel/specs/src/projects/satisfactory/endpoint/getResourceSinkEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../dictionaries/loopRequestDelay";

export function useGetResourceSink() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery<GetResourceSink["response"], GetResourceSink["error"]>({
			queryKey: ["getResourceSink"],
			queryFn: async () => {
				return fetchHandler<GetResourceSink>(
					{
						url: `${ApiPrefixEnum.SATISFACTORY}/getResourceSink`,
						method: HttpMethodEnum.GET,
						protected: false,
					},
					"http://localhost:8080",
				);
			},
			refetchInterval: loopRequestDelay.getResourceSink,
		});

	return {
		data,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	};
}
