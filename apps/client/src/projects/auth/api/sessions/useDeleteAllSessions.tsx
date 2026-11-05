import type { DeleteAllSessions } from "@citadel/specs/src/projects/auth/endpoint/sessions/deleteAllSessions/deleteAllSessionsEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { forgetSignedInAccount } from "../cache/forgetSignedInAccount";

// « Tout déconnecter », cette session comprise : plus personne n'est connecté, et rien du compte ne reste dans le cache
export function useDeleteAllSessions() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (): Promise<void> => {
			await fetchHandler<DeleteAllSessions>({
				url: `${ApiPrefixEnum.AUTH}/sessions`,
				method: HttpMethodEnum.DELETE,
				protected: true,
			});
		},
		onSuccess: () => {
			forgetSignedInAccount(queryClient);
		},
	});
}
