import type { GetAllGenerators } from "@specs/projects/satisfactory/endpoint/getAllGenerators.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum.ts";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch.ts";
import { loopRequestDelay } from "../../../dictionnaries/loopRequestDelay.ts";
import { generatorsDtoToFmMapper } from "./generatorsDtoToFm.mapper.ts";

export function useGetAllGenerators() {
	const {
		data: generatorsDto,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	} = useQuery<GetAllGenerators["response"], GetAllGenerators["error"]>({
		queryKey: ["getGenerators"],
		queryFn: async () => {
			return fetchHandler<GetAllGenerators>(
				{
					url: "/satisfactory/getGenerators",
					method: HttpMethodEnum.GET,
					protected: false,
				},
				"http://localhost:8080",
			);
		},
		refetchInterval: loopRequestDelay.getGenerator,
	});

	const generatorsFm = generatorsDtoToFmMapper(generatorsDto?.data ?? []);

	return {
		data: generatorsFm,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	};
}
