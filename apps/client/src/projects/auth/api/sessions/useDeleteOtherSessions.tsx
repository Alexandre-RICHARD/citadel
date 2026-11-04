import type { DeleteOtherSessions } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteOtherSessions/deleteOtherSessionsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

// « Tout déconnecter sauf ici »
export function useDeleteOtherSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (): Promise<void> => {
			await fetchHandler<DeleteOtherSessions>({
				url: `${ApiPrefixEnum.AUTH}/sessions/others`,
				method: HttpMethodEnum.DELETE,
				protected: true,
			});
		},
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() }),
	});
}
