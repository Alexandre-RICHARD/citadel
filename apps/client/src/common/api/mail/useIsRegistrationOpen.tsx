import { useQuery } from "@tanstack/react-query";

import { mailStatusQueryOptions } from "./mailStatusQueryOptions";

/**
 * Les inscriptions sont-elles ouvertes (interrupteur d'urgence, quota de mails) ? Ouvertes tant que l'état n'est pas
 * connu, ou si l'API ne répond pas : le serveur refusera de lui-même (403) une inscription fermée
 */
export function useIsRegistrationOpen(): boolean {
	return useQuery(mailStatusQueryOptions).data?.isRegistrationOpen ?? true;
}
