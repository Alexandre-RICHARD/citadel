import type { GetAllExtractors } from "@specs/project/satisfactory/endpoint/getAllExtractors.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch";
import { loopRequestDelay } from "../../../dictionnaries/loopRequestDelay";
import { extractorsDtoToFmMapper } from "./extractorsDtoToFm.mapper";

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
					url: "/getExtractor",
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
