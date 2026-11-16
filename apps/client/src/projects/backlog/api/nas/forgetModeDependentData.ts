import type { QueryClient } from "@tanstack/react-query";

import { backlogQueryKeys } from "../backlogQueryKeys";

/**
 * Le mode change (déverrouillé, verrouillé) : les lignes et les saisons en cache ne sont pas celles de l'autre mode (avec
 * ou sans colonnes du NAS, même clé pour les saisons) ; elles quittent le cache, et le statut se relit
 */
export async function forgetModeDependentData(
	queryClient: QueryClient,
): Promise<void> {
	queryClient.removeQueries({ queryKey: backlogQueryKeys.userMediaLists() });
	queryClient.removeQueries({ queryKey: backlogQueryKeys.showSeasonsOfAll() });
	queryClient.removeQueries({ queryKey: backlogQueryKeys.forgottenMedia() });
	await queryClient.invalidateQueries({
		queryKey: backlogQueryKeys.nasStatus(),
	});
}
