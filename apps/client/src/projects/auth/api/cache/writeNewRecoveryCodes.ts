import type { QueryClient } from "@tanstack/react-query";

import { authQueryKeys } from "../authQueryKeys";

// Les codes de secours qui viennent d'être donnés (premier facteur activé, ou codes refaits) : montrés une seule fois, ils
// attendent dans le cache que l'utilisateur dise les avoir sauvegardés. Rien ne les relit, rien ne les persiste
export function writeNewRecoveryCodes(
	queryClient: QueryClient,
	recoveryCodes: string[],
): void {
	queryClient.setQueryData<string[]>(
		authQueryKeys.newRecoveryCodes(),
		recoveryCodes,
	);
}
