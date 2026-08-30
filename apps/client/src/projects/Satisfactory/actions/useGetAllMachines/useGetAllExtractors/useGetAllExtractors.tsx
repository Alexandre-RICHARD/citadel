import type { GetAllExtractors } from "@specs/projects/satisfactory/endpoint/getAllExtractors.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum.ts";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../../../common/helpers/fetch/handlerFetch.ts";
import { loopRequestDelay } from "../../../dictionnaries/loopRequestDelay.ts";
import { extractorsDtoToFmMapper } from "./extractorsDtoToFm.mapper.ts";

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
					url: "/satisfactory/getExtractor",
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
