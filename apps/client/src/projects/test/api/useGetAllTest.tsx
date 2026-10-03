import type { GetAllTest } from "@citadel/specs/src/projects/test/endpoint/getAllTestEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/api/fetch/fetchHandler";
import { fromTestDtoToTestFm } from "./fromTestDtoToTestFm";

export function useGetAllTest() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery({
			queryKey: ["allTest"],
			queryFn: async ({ signal }) =>
				(
					await fetchHandler<GetAllTest>(
						{
							url: `${ApiPrefixEnum.TEST}/test`,
							method: HttpMethodEnum.GET,
							protected: false,
						},
						{ signal },
					)
				).data,
			select: (tests) => tests.map(fromTestDtoToTestFm),
		});

	return { data, error, isPending, isFetching, isRefetching, refetch };
}
