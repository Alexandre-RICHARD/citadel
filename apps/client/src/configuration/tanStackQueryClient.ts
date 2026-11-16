import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "../common/api/error/ApiError";
import { isLocalInstanceStartingError } from "../common/api/error/isLocalInstanceStartingError";
import { isSessionExpiredError } from "../common/api/error/isSessionExpiredError";
import { shouldRetryQuery } from "../common/api/query/shouldRetryQuery";
import { localInstanceStartingStore } from "../react/LocalInstanceStarting/localInstanceStartingStore";
import { leaveExpiredSession } from "./leaveExpiredSession";

const STALE_TIME_MS = 30_000;
// Sans Retry-After lisible : le temps habituel d'un démarrage de l'instance locale
const DEFAULT_STARTING_DELAY_SECONDS = 5;

// Une requête refusée faute de session (expirée, déconnectée ailleurs) : plus rien du compte ne reste, et la connexion
// ramènera à la page. L'instance locale du backlog des médias qui démarre : la page attend, puis se recharge
function onRequestError(queryClient: QueryClient, error: unknown): void {
	if (isSessionExpiredError(error)) leaveExpiredSession(queryClient);
	if (error instanceof ApiError && isLocalInstanceStartingError(error))
		localInstanceStartingStore.announce(
			error.retryAfterSeconds ?? DEFAULT_STARTING_DELAY_SECONDS,
		);
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
