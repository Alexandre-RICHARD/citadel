import type { GetAllTest } from "@citadel/specs/src/projects/test/endpoint/getAllTest.endpoint";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import { fetchHandler } from "../../../common/helpers/fetch/handlerFetch";

export function useGetAllTest() {
	const { data, error, isPending, isFetching, isRefetching, refetch } =
		useQuery<GetAllTest["response"], GetAllTest["error"]>({
			queryKey: ["allTest"],
			queryFn: async () => {
				return fetchHandler<GetAllTest>({
					url: "/test/test",
					method: HttpMethodEnum.GET,
					protected: false,
				});
			},
		});

	return { data, error, isPending, isFetching, isRefetching, refetch };
}
