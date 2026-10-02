import type { GetAllExtractors } from "@citadel/specs/src/projects/satisfactory/endpoint/getAllExtractorsEndpoint.type";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../../dictionaries/loopRequestDelay";
import { extractorsDtoToFmMapper } from "./extractorsDtoToFmMapper";

export function useGetAllExtractors() {
	const {
		data: extractorsDto,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	} = useQuery<GetAllExtractors["response"], GetAllExtractors["error"]>({
		queryKey: ["getExtractor"],
		queryFn: async () => {
			return fetchHandler<GetAllExtractors>(
				{
					url: `${ApiPrefixEnum.SATISFACTORY}/getExtractor`,
					method: HttpMethodEnum.GET,
					protected: false,
				},
				"http://localhost:8080",
			);
		},
		refetchInterval: loopRequestDelay.getExtractor,
	});

	const extractorsFm = extractorsDtoToFmMapper(extractorsDto?.data ?? []);

	return {
		data: extractorsFm,
		error,
		isPending,
		isFetching,
		isRefetching,
		refetch,
	};
}
