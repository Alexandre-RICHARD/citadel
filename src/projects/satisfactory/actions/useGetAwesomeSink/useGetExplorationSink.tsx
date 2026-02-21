import type { GetExplorationSink } from "@specs/project/satisfactory/endpoint/getExplorationSink.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../dictionnaries/loopRequestDelay";

export function useGetExplorationSink() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery<GetExplorationSink["response"], GetExplorationSink["error"]>({
			queryKey: ["getExplorationSink"],
			queryFn: async () => {
				return fetchHandler<GetExplorationSink>(
					{
						url: "/getExplorationSink",
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
