import type { DeleteMeBodyDto } from "@citadel/specs/src/projects/auth/endpoint/me/deleteMe/deleteMeBodyDto.type";
import type { DeleteMe } from "@citadel/specs/src/projects/auth/endpoint/me/deleteMe/deleteMeEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

// Supprime le compte, immédiatement et définitivement. Plus rien de lui ne reste dans le cache
export function useDeleteAccount() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (body: DeleteMeBodyDto): Promise<void> => {
			await fetchHandler<DeleteMe>({
				url: `${ApiPrefixEnum.AUTH}/me`,
				method: HttpMethodEnum.DELETE,
				protected: true,
				body,
			});
		},
		onSuccess: () => {
			queryClient.clear();
			queryClient.setQueryData(authQueryKeys.me(), null);
		},
	});
}
