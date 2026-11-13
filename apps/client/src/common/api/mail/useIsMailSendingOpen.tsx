import { useQuery } from "@tanstack/react-query";

import { mailStatusQueryOptions } from "./mailStatusQueryOptions";

/**
 * Les emails de l'authentification partent-ils encore aujourd'hui (quota d'emails) ? Ouverts tant que l'état n'est pas
 * connu, ou si l'API ne répond pas : le serveur refusera de lui-même (403 MAIL_CLOSED) un email qui ne peut plus partir
 */
export function useIsMailSendingOpen(): boolean {
	return useQuery(mailStatusQueryOptions).data?.isSendingOpen ?? true;
}
