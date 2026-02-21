import type { GetAllFactories } from "@specs/project/satisfactory/endpoint/getAllFactories.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../../dictionnaries/loopRequestDelay";
import { factoryDtoToFmMapper } from "./factoriesDtoToFm.mapper";

export function useGetAllFactories() {
	const {
		data: factoriesDto,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	} = useQuery<GetAllFactories["response"], GetAllFactories["error"]>({
		queryKey: ["getFactory"],
		queryFn: async () => {
			return fetchHandler<GetAllFactories>(
				{
					url: "/getFactory",
					method: HttpMethodEnum.GET,
					protected: false,
				},
				"http://localhost:8080",
			);
		},
		refetchInterval: loopRequestDelay.getFactory,
	});

	const factoriesFm = factoryDtoToFmMapper(factoriesDto?.data ?? []);

	return {
		data: factoriesFm,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	};
}
