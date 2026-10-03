import type { GetOneTest } from "@citadel/specs/src/projects/test/endpoint/getOneTestEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/api/fetch/fetchHandler";
import { fromTestDtoToTestFm } from "./fromTestDtoToTestFm";

type Props = {
	payload: {
		id: string | null;
	};
};

export function useGetOneTest({ payload }: Props) {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery({
			enabled: Boolean(payload.id),
			queryKey: ["oneTest", payload.id],
			queryFn: async ({ signal }) =>
				(
					await fetchHandler<GetOneTest>(
						{
							url: `${ApiPrefixEnum.TEST}/test/:id`,
							method: HttpMethodEnum.GET,
							protected: false,
							pathParams: { id: payload.id ?? "-1" },
						},
						{ signal },
					)
				).data,
			select: fromTestDtoToTestFm,
		});

	return { data, error, isPending, isFetching, isRefetching, refetch };
}
