import { useQuery } from "@tanstack/react-query";

import { mailStatusQueryOptions } from "./mailStatusQueryOptions";

/**
 * Le formulaire de contact est-il ouvert ? Ouvert tant que l'état n'est pas connu, ou si l'API ne répond pas : le
 * serveur refusera de lui-même (403) un message que le quota interdit
 */
export function useIsContactOpen(): boolean {
	return useQuery(mailStatusQueryOptions).data?.isContactOpen ?? true;
}
