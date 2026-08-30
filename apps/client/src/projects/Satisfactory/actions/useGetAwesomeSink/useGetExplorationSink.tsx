import type { GetExplorationSink } from "@specs/projects/satisfactory/endpoint/getExplorationSink.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum.ts";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/helpers/fetch/handlerFetch.ts";
import { loopRequestDelay } from "../../dictionnaries/loopRequestDelay.ts";

export function useGetExplorationSink() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery<GetExplorationSink["response"], GetExplorationSink["error"]>({
			queryKey: ["getExplorationSink"],
			queryFn: async () => {
				return fetchHandler<GetExplorationSink>(
					{
						url: "/satisfactory/getExplorationSink",
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
