import type { DeleteSession } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteSession/deleteSessionEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { authQueryKeys } from "../authQueryKeys";

// Déconnecte une session du compte, sans confirmation. Celle de ce navigateur : plus de session, plus de compte affiché
export function useDeleteSession() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (sessionId: number): Promise<void> => {
			await fetchHandler<DeleteSession>({
				url: `${ApiPrefixEnum.AUTH}/sessions/:sessionId`,
				method: HttpMethodEnum.DELETE,
				protected: true,
				pathParams: { sessionId },
			});
		},
		onSuccess: () =>
			Promise.all([
				queryClient.invalidateQueries({ queryKey: authQueryKeys.sessions() }),
				queryClient.invalidateQueries({ queryKey: authQueryKeys.me() }),
			]),
	});
}
