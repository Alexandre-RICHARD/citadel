import type { UpdateMeBodyDto } from "@citadel/specs/src/projects/auth/endpoint/me/updateMe/updateMeBodyDto.type";
import type { UpdateMe } from "@citadel/specs/src/projects/auth/endpoint/me/updateMe/updateMeEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

// Le pseudo affiché et/ou les méthodes de connexion. Le compte à jour répondu par le serveur remplace celui du cache
export function useUpdateMe() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: UpdateMeBodyDto) =>
			(
				await fetchHandler<UpdateMe>({
					url: `${ApiPrefixEnum.AUTH}/me`,
					method: HttpMethodEnum.PATCH,
					protected: true,
					body,
				})
			).data,
		onSuccess: (me) => {
			queryClient.setQueryData(authQueryKeys.me(), me);
		},
	});
}
