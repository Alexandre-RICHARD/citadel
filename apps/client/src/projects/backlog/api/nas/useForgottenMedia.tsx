import type { GetForgottenMedia } from "@citadel/specs/src/projects/backlog/endpoint/nas/getForgottenMedia/getForgottenMediaEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useQuery } from "@tanstack/react-query";

import type { ApiError } from "../../../../common/api/error/ApiError";
import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { backlogQueryKeys } from "../backlogQueryKeys";
import type { ForgottenMediaFm } from "../model/nas/forgottenMediaFm.type";

type ForgottenMedia = {
	// undefined pendant la lecture
	forgottenMedia: ForgottenMediaFm[] | undefined;
	error: ApiError | null;
};

// Les médias oubliés, au-dessus du tableau en mode connecté ; sans suspension, le tableau ne les attend pas
export function useForgottenMedia(): ForgottenMedia {
	const query = useQuery({
		queryKey: backlogQueryKeys.forgottenMedia(),
		queryFn: async ({ signal }) =>
			(
				await fetchHandler<GetForgottenMedia>(
					{
						url: `${ApiPrefixEnum.BACKLOG}/nas/forgotten-media`,
						method: HttpMethodEnum.GET,
						protected: true,
					},
					{ signal },
				)
			).data.forgottenMedia,
	});
	return {
		forgottenMedia: query.data,
		error: query.error as ApiError | null,
	};
}
