import type { QueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "../authQueryKeys";

// Plus personne n'est connecté : rien du compte ne reste dans le cache, et le site le sait sans relire GET /auth/me
export function forgetSignedInAccount(queryClient: QueryClient): void {
	queryClient.clear();
	queryClient.setQueryData(authQueryKeys.me(), null);
}
