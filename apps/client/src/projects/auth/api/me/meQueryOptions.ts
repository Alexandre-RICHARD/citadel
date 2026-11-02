import type { MeDto } from "@citadel/specs/src/projects/auth/dto/meDto.type";
import type { GetMe } from "@citadel/specs/src/projects/auth/endpoint/me/getMe/getMeEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { HttpStatutCodeErrorEnum } from "@citadel/specs/src/specUtils/httpStatutCodeError.enum";
import { queryOptions } from "@tanstack/react-query";

import { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

// Qui est connecté ; null : personne. Le 401 de cet endpoint n'est pas une erreur, c'est la réponse « pas connecté »
export const meQueryOptions = queryOptions({
	queryKey: authQueryKeys.me(),
	queryFn: async ({ signal }): Promise<MeDto | null> => {
		try {
			const { data } = await fetchHandler<GetMe>(
				{
					url: `${ApiPrefixEnum.AUTH}/me`,
					method: HttpMethodEnum.GET,
					protected: true,
				},
				{ signal },
			);
			return data;
		} catch (error) {
			if (
				error instanceof ApiError &&
				error.status === Number(HttpStatutCodeErrorEnum.NEED_AUTHENTIFICATION)
			)
				return null;
			throw error;
		}
	},
});
