import type { GetAllFactories } from "@citadel/specs/src/projects/satisfactory/endpoint/getAllFactoriesEndpoint.type";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../../dictionaries/loopRequestDelay";
import { factoryDtoToFmMapper } from "./factoriesDtoToFmMapper";

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
					url: `${ApiPrefixEnum.SATISFACTORY}/getFactory`,
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
