import type { GetExplorationSink } from "@citadel/specs/src/projects/satisfactory/endpoint/getExplorationSinkEndpoint";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../dictionaries/loopRequestDelay";

export function useGetExplorationSink() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery<GetExplorationSink["response"], GetExplorationSink["error"]>({
			queryKey: ["getExplorationSink"],
			queryFn: async () => {
				return fetchHandler<GetExplorationSink>(
					{
						url: `${ApiPrefixEnum.SATISFACTORY}/getExplorationSink`,
						method: HttpMethodEnum.GET,
						protected: false,
					},
					"http://localhost:8080",
				);
			},
			refetchInterval: loopRequestDelay.getExplorationSink,
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
