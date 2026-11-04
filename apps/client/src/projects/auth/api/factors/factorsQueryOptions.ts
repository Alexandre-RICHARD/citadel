import type { ListFactors } from "@citadel/specs/src/projects/auth/endpoint/factors/listFactors/listFactorsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { queryOptions } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";
import { fromFactorListDtoToFactorsFm } from "../model/fromFactorListDtoToFactorsFm";

// La double authentification du compte : relue à chaque arrivée sur le profil (un code de secours a pu servir ailleurs)
export const factorsQueryOptions = queryOptions({
	queryKey: authQueryKeys.factors(),
	queryFn: async ({ signal }) =>
		fromFactorListDtoToFactorsFm(
			(
				await fetchHandler<ListFactors>(
					{
						url: `${ApiPrefixEnum.AUTH}/factors`,
						method: HttpMethodEnum.GET,
						protected: true,
					},
					{ signal },
				)
			).data,
		),
	staleTime: 0,
});
