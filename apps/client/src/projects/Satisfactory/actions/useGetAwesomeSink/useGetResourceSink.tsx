import type { GetResourceSink } from "@specs/projects/satisfactory/endpoint/getResourceSink.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum.ts";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/helpers/fetch/handlerFetch.ts";
import { loopRequestDelay } from "../../dictionnaries/loopRequestDelay.ts";

export function useGetResourceSink() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery<GetResourceSink["response"], GetResourceSink["error"]>({
			queryKey: ["getResourceSink"],
			queryFn: async () => {
				return fetchHandler<GetResourceSink>(
					{
						url: "/satisfactory/getResourceSink",
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
