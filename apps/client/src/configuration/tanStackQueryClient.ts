import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { isSessionExpiredError } from "../common/api/error/isSessionExpiredError";
import { shouldRetryQuery } from "../common/api/query/shouldRetryQuery";
import { leaveExpiredSession } from "./leaveExpiredSession";

const STALE_TIME_MS = 30_000;

// Une requête refusée faute de session (expirée, déconnectée ailleurs) : plus rien du compte ne reste, et la connexion
// ramènera à la page
function onRequestError(queryClient: QueryClient, error: unknown): void {
	if (isSessionExpiredError(error)) leaveExpiredSession(queryClient);
}

export const tanStackQueryClient: QueryClient = new QueryClient({
	queryCache: new QueryCache({
		onError: (error) => {
			onRequestError(tanStackQueryClient, error);
		},
	}),
	mutationCache: new MutationCache({
		onError: (error) => {
			onRequestError(tanStackQueryClient, error);
		},
	}),
	defaultOptions: {
		queries: {
			staleTime: STALE_TIME_MS,
			retry: shouldRetryQuery,
			// L'UI affiche l'erreur au lieu d'attendre indéfiniment le retour du réseau
			networkMode: "always",
		},
		mutations: {
			retry: false,
			networkMode: "always",
		},
	},
});
