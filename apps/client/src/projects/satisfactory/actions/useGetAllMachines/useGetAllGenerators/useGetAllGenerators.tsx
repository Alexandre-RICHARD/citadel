import type { GetAllGenerators } from "@citadel/specs/src/projects/satisfactory/endpoint/getAllGeneratorsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../../dictionaries/loopRequestDelay";
import { generatorsDtoToFmMapper } from "./generatorsDtoToFmMapper";

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
					url: `${ApiPrefixEnum.SATISFACTORY}/getGenerators`,
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
