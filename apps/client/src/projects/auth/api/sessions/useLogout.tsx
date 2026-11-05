import type { Logout } from "@citadel/specs/src/projects/auth/endpoint/sessions/logout/logoutEndpoint.interface";
import { ApiPrefixEnum } from "@citadel/specs/src/specUtils/apiPrefix.enum";
import { HttpMethodEnum } from "@citadel/specs/src/specUtils/httpMethod.enum";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { fetchHandler } from "../../../../common/api/fetch/fetchHandler";
import { forgetSignedInAccount } from "../cache/forgetSignedInAccount";

// Ferme la session de ce navigateur : rien du compte ne reste dans le cache. Les autres onglets l'apprendront au 401 de
// leur prochain appel
export function useLogout() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (): Promise<void> => {
			await fetchHandler<Logout>({
				url: `${ApiPrefixEnum.AUTH}/logout`,
				method: HttpMethodEnum.POST,
				protected: false,
			});
		},
		onSuccess: () => {
			forgetSignedInAccount(queryClient);
		},
	});
}
